import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  BYTES_PER_ROW,
  BYTES_PER_PAGE,
  formatOffset,
  getAsciiChar,
} from '../utils/hexUtils';

export default function HexEditor({
  hexBytes,
  selectionStart,
  selectionEnd,
  onBeginSelection,
  onExtendSelection,
  onEndSelection,
  onStash,
  unlockedOffset,
  levelData,
  goToOffsetTrigger,
  stashedChunks,
}) {
  const scrollRef = useRef(null);
  const ROW_HEIGHT = 22; // px – must match leading-[22px]

  // Normalized selection range
  const sStart = selectionStart !== null && selectionEnd !== null
    ? Math.min(selectionStart, selectionEnd) : -1;
  const sEnd = selectionStart !== null && selectionEnd !== null
    ? Math.max(selectionStart, selectionEnd) : -1;

  // Total rows in the dump
  const totalRows = useMemo(() => Math.ceil(hexBytes.length / BYTES_PER_ROW), [hexBytes.length]);

  // Current "sector" label derived from scroll position
  const [visibleSector, setVisibleSector] = useState(1);
  const totalSectors = useMemo(() => Math.max(1, Math.ceil(hexBytes.length / BYTES_PER_PAGE)), [hexBytes.length]);

  const updateSectorLabel = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const rowIdx = Math.floor(scrollTop / ROW_HEIGHT);
    const byteOffset = rowIdx * BYTES_PER_ROW;
    const sector = Math.floor(byteOffset / BYTES_PER_PAGE) + 1;
    setVisibleSector(Math.min(sector, totalSectors));
  }, [totalSectors]);

  // Scroll to a specific byte offset
  const scrollToOffset = useCallback((offset) => {
    if (!scrollRef.current) return;
    const row = Math.floor(offset / BYTES_PER_ROW);
    const targetScroll = row * ROW_HEIGHT;
    scrollRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, []);

  // External navigation trigger from terminal "go <offset>"
  useEffect(() => {
    if (goToOffsetTrigger && goToOffsetTrigger.offset !== undefined) {
      scrollToOffset(goToOffsetTrigger.offset);
    }
  }, [goToOffsetTrigger, scrollToOffset]);

  // Stashed decoy ranges (for visual feedback after stashing)
  const stashedDecoyRanges = useMemo(() => {
    return (stashedChunks || []).filter(c => c.verdict === 'decoy').map(c => ({ start: c.start, end: c.end }));
  }, [stashedChunks]);

  // MBR obfuscation check
  const isMbrLevel = levelData?.difficulty === 'mbr';
  const mbrUnlocked = unlockedOffset !== null;

  // Build ALL rows (no pagination — continuous scroll)
  const rows = useMemo(() => {
    const result = [];
    for (let r = 0; r < totalRows; r++) {
      const absOffset = r * BYTES_PER_ROW;
      const rowBytes = hexBytes.slice(absOffset, absOffset + BYTES_PER_ROW);
      result.push({ rowBytes, absOffset });
    }
    return result;
  }, [hexBytes, totalRows]);

  // Visible range for scroll position (first/last visible byte offsets)
  const [viewRange, setViewRange] = useState({ start: 0, end: 0 });
  const updateViewRange = useCallback(() => {
    if (!scrollRef.current) return;
    const st = scrollRef.current.scrollTop;
    const h = scrollRef.current.clientHeight;
    const firstRow = Math.floor(st / ROW_HEIGHT);
    const lastRow = Math.min(Math.floor((st + h) / ROW_HEIGHT), totalRows - 1);
    setViewRange({
      start: firstRow * BYTES_PER_ROW,
      end: Math.min((lastRow + 1) * BYTES_PER_ROW - 1, hexBytes.length - 1),
    });
  }, [totalRows, hexBytes.length]);

  useEffect(() => {
    updateViewRange();
  }, [hexBytes.length, updateViewRange]);

  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg flex flex-col flex-1 min-h-0 overflow-hidden"
         style={{ boxShadow: '0 0 20px rgba(0,0,0,0.3)' }}>
      {/* Toolbar */}
      <div className="flex justify-between items-center border-b border-gray-800 px-4 py-2.5 shrink-0 bg-gray-900">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-bold text-gray-300 tracking-widest uppercase flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hexBytes.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}
                  style={hexBytes.length > 0 ? { boxShadow: '0 0 8px rgba(74,222,128,0.6)' } : {}} />
            Hex Editor
          </h2>
          {hexBytes.length > 0 && (
            <span className="text-[10px] text-gray-600 font-mono">
              {hexBytes.length} bytes
            </span>
          )}
          {sStart >= 0 && (
            <span className="text-[10px] bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded border border-blue-800/50 font-mono">
              SEL: {sEnd - sStart + 1}B @ 0x{formatOffset(sStart)}–0x{formatOffset(sEnd)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {sStart >= 0 && (
            <button
              onClick={onStash}
              className="bg-cyan-700/50 hover:bg-cyan-600/60 text-cyan-200 font-bold py-1 px-3 rounded text-[10px] transition-all border border-cyan-600/40 uppercase tracking-wider"
            >
              + Stash Selection
            </button>
          )}
        </div>
      </div>

      {/* Hex content — continuous scroll */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0" onMouseUp={onEndSelection}>
        {hexBytes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
            <div className="text-center">
              <div className="text-3xl mb-3 opacity-30">⬡</div>
              <p>No datastream loaded.</p>
              <p className="text-xs text-gray-700 mt-1">Select a case from the Mission Log to begin.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="flex px-4 py-1.5 border-b border-gray-800/70 text-gray-600 text-[10px] shrink-0 bg-gray-950/50 select-none">
              <div className="w-[72px] shrink-0">OFFSET</div>
              <div className="flex gap-0 mr-4" style={{ width: `${BYTES_PER_ROW * 28}px` }}>
                {Array.from({ length: BYTES_PER_ROW }).map((_, i) => (
                  <div key={i} className="w-7 text-center">{i.toString(16).toUpperCase().padStart(2, '0')}</div>
                ))}
              </div>
              <div>ASCII</div>
            </div>

            {/* All rows — scrollable */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 font-mono text-[13px] select-none min-h-0"
              onScroll={() => { updateSectorLabel(); updateViewRange(); }}
            >
              {rows.map(({ rowBytes, absOffset }) => {
                // MBR obfuscation: hide sectors beyond 512 if not unlocked
                const isObfuscated = isMbrLevel && !mbrUnlocked && absOffset >= 512;

                if (isObfuscated) {
                  return (
                    <div key={absOffset} className="flex h-[22px] items-center text-red-500/40">
                      <div className="w-[72px] shrink-0 text-red-700/50">{formatOffset(absOffset)}</div>
                      <div className="italic text-[10px] flex items-center text-red-600/40">
                        ◆ ENCRYPTED SECTOR — use "go &lt;offset&gt;" to unlock
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={absOffset} className="flex h-[22px] items-center hover:bg-gray-800/30">
                    <div className="w-[72px] shrink-0 text-blue-500/60 select-none">{formatOffset(absOffset)}</div>

                    {/* Hex bytes */}
                    <div className="flex gap-0 mr-4" style={{ width: `${BYTES_PER_ROW * 28}px` }}>
                      {rowBytes.map((byte, bIdx) => {
                        const absIdx = absOffset + bIdx;
                        const isSelected = absIdx >= sStart && absIdx <= sEnd;
                        const isDecoy = stashedDecoyRanges.some(r => absIdx >= r.start && absIdx <= r.end);
                        return (
                          <div
                            key={bIdx}
                            onMouseDown={() => onBeginSelection(absIdx)}
                            onMouseEnter={() => onExtendSelection(absIdx)}
                            className={`w-7 text-center cursor-crosshair transition-colors duration-0
                              ${isSelected
                                ? 'bg-blue-500/80 text-white rounded-sm'
                                : isDecoy
                                  ? 'bg-red-900/30 text-red-400/70'
                                  : 'hover:bg-gray-700/40 text-green-300/80'
                              }`}
                            style={isSelected ? { boxShadow: '0 0 4px rgba(59,130,246,0.5)' } : {}}
                          >
                            {byte}
                          </div>
                        );
                      })}
                      {/* Pad if row is short */}
                      {rowBytes.length < BYTES_PER_ROW && Array.from({ length: BYTES_PER_ROW - rowBytes.length }).map((_, i) => (
                        <div key={`pad-${i}`} className="w-7" />
                      ))}
                    </div>

                    {/* ASCII */}
                    <div className="text-gray-500/70 tracking-wider flex select-none">
                      {rowBytes.map((byte, bIdx) => {
                        const absIdx = absOffset + bIdx;
                        const isSelected = absIdx >= sStart && absIdx <= sEnd;
                        const isDecoy = stashedDecoyRanges.some(r => absIdx >= r.start && absIdx <= r.end);
                        return (
                          <span
                            key={`a-${bIdx}`}
                            className={`inline-block w-[10px] text-center transition-colors duration-0
                              ${isSelected ? 'bg-blue-500/60 text-white rounded-sm'
                                : isDecoy ? 'text-red-400/50' : ''}`}
                          >
                            {getAsciiChar(byte)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Status footer */}
      {hexBytes.length > 0 && (
        <div className="border-t border-gray-800 px-4 py-2 flex items-center justify-between shrink-0 bg-gray-950/50">
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>Sector</span>
            <span className="text-cyan-400 font-mono font-bold tabular-nums">{visibleSector}</span>
            <span>/</span>
            <span className="font-mono tabular-nums">{totalSectors}</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono">
            <span>
              0x{formatOffset(viewRange.start)}—0x{formatOffset(viewRange.end)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-600">
            <span>{totalRows} rows</span>
            <span className="text-gray-700">|</span>
            <span>Scroll to navigate • Drag to select</span>
          </div>
        </div>
      )}
    </div>
  );
}
