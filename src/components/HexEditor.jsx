import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  BYTES_PER_ROW,
  ROWS_PER_PAGE,
  BYTES_PER_PAGE,
  getTotalPages,
  getPageBytes,
  getPageForOffset,
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
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = useMemo(() => getTotalPages(hexBytes.length), [hexBytes.length]);
  const pageBytes = useMemo(() => getPageBytes(hexBytes, currentPage), [hexBytes, currentPage]);

  // Normalized selection range
  const sStart = selectionStart !== null && selectionEnd !== null
    ? Math.min(selectionStart, selectionEnd) : -1;
  const sEnd = selectionStart !== null && selectionEnd !== null
    ? Math.max(selectionStart, selectionEnd) : -1;

  const goToPage = useCallback((p) => {
    const clamped = Math.max(0, Math.min(p, totalPages - 1));
    setCurrentPage(clamped);
  }, [totalPages]);

  const goToOffset = useCallback((offset) => {
    const page = getPageForOffset(offset);
    goToPage(page);
  }, [goToPage]);

  // External navigation trigger from terminal "go <offset>"
  useEffect(() => {
    if (goToOffsetTrigger && goToOffsetTrigger.offset !== undefined) {
      goToOffset(goToOffsetTrigger.offset);
    }
  }, [goToOffsetTrigger, goToOffset]);

  // False positive ranges from level metadata
  const falsePositives = useMemo(() => {
    return levelData?.metadata?.false_positives || [];
  }, [levelData]);

  // Stashed decoy ranges (for visual feedback after stashing)
  const stashedDecoyRanges = useMemo(() => {
    return (stashedChunks || []).filter(c => c.verdict === 'decoy').map(c => ({ start: c.start, end: c.end }));
  }, [stashedChunks]);

  // MBR obfuscation check
  const isMbrLevel = levelData?.difficulty === 'mbr';
  const mbrUnlocked = unlockedOffset !== null;

  // Page offset start for absolute indices
  const pageStartOffset = currentPage * BYTES_PER_PAGE;

  // Build rows
  const rows = [];
  for (let r = 0; r < ROWS_PER_PAGE; r++) {
    const rowOffset = r * BYTES_PER_ROW;
    if (rowOffset >= pageBytes.length) break;
    const rowBytes = pageBytes.slice(rowOffset, rowOffset + BYTES_PER_ROW);
    const absOffset = pageStartOffset + rowOffset;
    rows.push({ rowBytes, absOffset });
  }

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
              SEL: {sEnd - sStart + 1}B @ 0x{formatOffset(sStart)}
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

      {/* Hex content */}
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

            {/* Rows */}
            <div className="flex-1 overflow-y-auto px-4 font-mono text-[13px] leading-[22px] select-none min-h-0">
              {rows.map(({ rowBytes, absOffset }) => {
                // MBR obfuscation: hide sectors beyond 512 if not unlocked
                const isObfuscated = isMbrLevel && !mbrUnlocked && absOffset >= 512;

                if (isObfuscated) {
                  return (
                    <div key={absOffset} className="flex py-px text-red-500/40">
                      <div className="w-[72px] shrink-0 text-red-700/50">{formatOffset(absOffset)}</div>
                      <div className="italic text-[10px] flex items-center text-red-600/40">
                        ◆ ENCRYPTED SECTOR — use "go &lt;offset&gt;" to unlock
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={absOffset} className="flex py-px hover:bg-gray-800/30">
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

      {/* Pagination footer */}
      {hexBytes.length > 0 && (
        <div className="border-t border-gray-800 px-4 py-2 flex items-center justify-between shrink-0 bg-gray-950/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(0)}
              disabled={currentPage === 0}
              className="text-[10px] px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700/50 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ⟨⟨
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="text-[10px] px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700/50 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ◀ PREV
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>Sector</span>
            <span className="text-cyan-400 font-mono font-bold tabular-nums">{currentPage + 1}</span>
            <span>/</span>
            <span className="font-mono tabular-nums">{totalPages}</span>
            <span className="text-gray-600 mx-1">|</span>
            <span className="text-gray-600 font-mono">
              0x{formatOffset(pageStartOffset)}—0x{formatOffset(Math.min(pageStartOffset + BYTES_PER_PAGE - 1, hexBytes.length - 1))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="text-[10px] px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700/50 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              NEXT ▶
            </button>
            <button
              onClick={() => goToPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="text-[10px] px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700/50 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ⟩⟩
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
