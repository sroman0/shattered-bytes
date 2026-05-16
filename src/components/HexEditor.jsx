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
  const isDraggingRef = useRef(false);
  const rafRef = useRef(null);
  const mouseYRef = useRef(0);
  const mouseXRef = useRef(0);
  const [rangeStartInput, setRangeStartInput] = useState('');
  const [rangeEndInput, setRangeEndInput] = useState('');
  const [rangeError, setRangeError] = useState('');
  const ROW_HEIGHT = 22;
  const OFFSET_COLUMN_WIDTH = 72;
  const BYTE_CELL_WIDTH = 28;
  const SCROLL_CONTAINER_PADDING_X = 16;
  const AUTO_SCROLL_EDGE_ZONE = 80;
  const AUTO_SCROLL_MAX_SPEED = 22;
  const selectedByteStyle = {
    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.74), rgba(16, 185, 129, 0.58))',
    color: '#ECFEFF',
    boxShadow: 'inset 0 0 0 1px rgba(103, 232, 249, 0.5), 0 0 9px rgba(16, 185, 129, 0.25)',
    textShadow: '0 0 6px rgba(6, 182, 212, 0.45)',
  };
  const selectedAsciiStyle = {
    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.34), rgba(16, 185, 129, 0.22))',
    color: '#D1FAE5',
    boxShadow: 'inset 0 -1px 0 rgba(45, 212, 191, 0.45), inset 0 1px 0 rgba(16, 185, 129, 0.22)',
    textShadow: '0 0 5px rgba(45, 212, 191, 0.35)',
  };

  // Normalized selection range
  const sStart = selectionStart !== null && selectionEnd !== null
    ? Math.min(selectionStart, selectionEnd) : -1;
  const sEnd = selectionStart !== null && selectionEnd !== null
    ? Math.max(selectionStart, selectionEnd) : -1;

  const totalRows = useMemo(() => Math.ceil(hexBytes.length / BYTES_PER_ROW), [hexBytes.length]);

  const [visibleSector, setVisibleSector] = useState(1);
  const totalSectors = useMemo(() => Math.max(1, Math.ceil(hexBytes.length / BYTES_PER_PAGE)), [hexBytes.length]);
  const isMbrLevel = levelData?.difficulty === 'mbr';
  const mbrUnlocked = unlockedOffset !== null;

  const updateSectorLabel = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const rowIdx = Math.floor(scrollTop / ROW_HEIGHT);
    const byteOffset = rowIdx * BYTES_PER_ROW;
    const sector = Math.floor(byteOffset / BYTES_PER_PAGE) + 1;
    setVisibleSector(Math.min(sector, totalSectors));
  }, [totalSectors]);

  const scrollToOffset = useCallback((offset) => {
    if (!scrollRef.current) return;
    const row = Math.floor(offset / BYTES_PER_ROW);
    const targetScroll = row * ROW_HEIGHT;
    scrollRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, []);

  const parseOffsetInput = useCallback((value) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return null;
    const parsed = trimmed.startsWith('0x')
      ? parseInt(trimmed, 16)
      : parseInt(trimmed, 10);
    if (Number.isNaN(parsed) || parsed < 0 || parsed >= hexBytes.length) return null;
    return parsed;
  }, [hexBytes.length]);

  const applyRangeSelection = useCallback(() => {
    const start = parseOffsetInput(rangeStartInput);
    const end = parseOffsetInput(rangeEndInput);
    if (start === null || end === null) {
      setRangeError('Invalid offset');
      return;
    }
    const s = Math.min(start, end);
    const e = Math.max(start, end);
    if (isMbrLevel && !mbrUnlocked && e >= 512) {
      setRangeError('Locked sector');
      return;
    }
    onBeginSelection(s);
    onExtendSelection(e);
    onEndSelection();
    scrollToOffset(s);
    setRangeError('');
  }, [isMbrLevel, mbrUnlocked, onBeginSelection, onEndSelection, onExtendSelection, parseOffsetInput, rangeEndInput, rangeStartInput, scrollToOffset]);

  useEffect(() => {
    if (goToOffsetTrigger && goToOffsetTrigger.offset !== undefined) {
      scrollToOffset(goToOffsetTrigger.offset);
    }
  }, [goToOffsetTrigger, scrollToOffset]);

  const stashedDecoyRanges = useMemo(() => {
    return (stashedChunks || []).filter(c => c.verdict === 'decoy').map(c => ({ start: c.start, end: c.end }));
  }, [stashedChunks]);

  const rows = useMemo(() => {
    const result = [];
    for (let r = 0; r < totalRows; r++) {
      const absOffset = r * BYTES_PER_ROW;
      const rowBytes = hexBytes.slice(absOffset, absOffset + BYTES_PER_ROW);
      result.push({ rowBytes, absOffset });
    }
    return result;
  }, [hexBytes, totalRows]);

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

  // ── Auto-scroll during drag ──
  // Compute the byte index at a given pointer coordinate within the scroll container.
  // This keeps drag selection precise even while the container scrolls.
  const getByteIndexAtPoint = useCallback((clientX, clientY) => {
    if (!scrollRef.current) return null;
    const rect = scrollRef.current.getBoundingClientRect();
    const visibleY = Math.max(rect.top + 1, Math.min(clientY, rect.bottom - 1));
    const relY = visibleY - rect.top + scrollRef.current.scrollTop;
    const row = Math.floor(relY / ROW_HEIGHT);
    const clampedRow = Math.max(0, Math.min(row, totalRows - 1));

    const hexStartX = rect.left + SCROLL_CONTAINER_PADDING_X + OFFSET_COLUMN_WIDTH;
    const relX = clientX - hexStartX;
    const col = Math.floor(relX / BYTE_CELL_WIDTH);
    const clampedCol = Math.max(0, Math.min(col, BYTES_PER_ROW - 1));

    return Math.min(clampedRow * BYTES_PER_ROW + clampedCol, hexBytes.length - 1);
  }, [totalRows, hexBytes.length]);

  // The auto-scroll animation loop
  const autoScrollLoop = useCallback(() => {
    if (!isDraggingRef.current || !scrollRef.current) return;

    const el = scrollRef.current;
    const rect = el.getBoundingClientRect();
    const y = mouseYRef.current;
    const x = mouseXRef.current;

    let scrollDelta = 0;

    if (y < rect.top + AUTO_SCROLL_EDGE_ZONE) {
      // Near top edge — scroll up
      const proximity = Math.max(0, 1 - (y - rect.top) / AUTO_SCROLL_EDGE_ZONE); // 0..1
      scrollDelta = -AUTO_SCROLL_MAX_SPEED * proximity;
    } else if (y > rect.bottom - AUTO_SCROLL_EDGE_ZONE) {
      // Near bottom edge — scroll down
      const proximity = Math.max(0, 1 - (rect.bottom - y) / AUTO_SCROLL_EDGE_ZONE); // 0..1
      scrollDelta = AUTO_SCROLL_MAX_SPEED * proximity;
    }

    if (scrollDelta !== 0) {
      const maxScrollTop = el.scrollHeight - el.clientHeight;
      el.scrollTop = Math.max(0, Math.min(maxScrollTop, el.scrollTop + scrollDelta));

      // Keep the active endpoint on the visible edge while auto-scrolling,
      // otherwise the range can grow to off-screen bytes without visual feedback.
      const visibleEdgeY = scrollDelta > 0 ? rect.bottom - 2 : rect.top + 2;
      const byteIdx = getByteIndexAtPoint(x, visibleEdgeY);
      if (byteIdx !== null) {
        onExtendSelection(byteIdx);
      }

      updateSectorLabel();
      updateViewRange();
    }

    rafRef.current = requestAnimationFrame(autoScrollLoop);
  }, [getByteIndexAtPoint, onExtendSelection, updateSectorLabel, updateViewRange]);

  const trackPointer = useCallback((e) => {
    mouseXRef.current = e.clientX;
    mouseYRef.current = e.clientY;
  }, []);

  // Start drag
  const handleByteMouseDown = useCallback((e, absIdx) => {
    e.preventDefault();
    trackPointer(e);
    if (e.shiftKey && selectionStart !== null) {
      onExtendSelection(absIdx);
      onEndSelection();
      return;
    }
    isDraggingRef.current = true;
    onBeginSelection(absIdx);
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(autoScrollLoop);
    }
  }, [selectionStart, onBeginSelection, onEndSelection, onExtendSelection, autoScrollLoop, trackPointer]);

  // Track mouse position globally during drag
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;
      if (isDraggingRef.current) {
        const el = scrollRef.current;
        const rect = el?.getBoundingClientRect();
        const targetY = rect
          ? Math.max(rect.top + 1, Math.min(e.clientY, rect.bottom - 1))
          : e.clientY;
        const byteIdx = getByteIndexAtPoint(e.clientX, targetY);
        if (byteIdx !== null) onExtendSelection(byteIdx);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        onEndSelection();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [getByteIndexAtPoint, onEndSelection, onExtendSelection]);

  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg flex flex-col flex-1 min-h-0 overflow-hidden"
         style={{ boxShadow: '0 0 20px rgba(0,0,0,0.3)' }}>
      {/* Toolbar */}
      <div className="flex justify-between items-center gap-3 border-b border-gray-800 px-4 py-2.5 shrink-0 bg-gray-900">
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
            <span className="text-[10px] bg-emerald-950/50 text-cyan-200 px-2 py-0.5 rounded border border-cyan-700/50 font-mono shadow-[0_0_10px_rgba(20,184,166,0.16)]">
              SEL: {sEnd - sStart + 1}B @ 0x{formatOffset(sStart)}–0x{formatOffset(sEnd)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-1.5"
            title="Range select by byte offset. Accepts decimal or 0x hex offsets."
          >
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Range</span>
            <input
              type="text"
              value={rangeStartInput}
              onChange={(e) => {
                setRangeStartInput(e.target.value);
                setRangeError('');
              }}
              placeholder="start"
              className={`w-20 bg-gray-950/70 border rounded px-2 py-1 text-[10px] text-cyan-200 outline-none font-mono
                ${rangeError ? 'border-red-600/60' : 'border-gray-700 focus:border-cyan-600/70'}`}
              spellCheck={false}
            />
            <input
              type="text"
              value={rangeEndInput}
              onChange={(e) => {
                setRangeEndInput(e.target.value);
                setRangeError('');
              }}
              placeholder="end"
              className={`w-20 bg-gray-950/70 border rounded px-2 py-1 text-[10px] text-cyan-200 outline-none font-mono
                ${rangeError ? 'border-red-600/60' : 'border-gray-700 focus:border-cyan-600/70'}`}
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyRangeSelection();
              }}
            />
            <button
              type="button"
              onClick={applyRangeSelection}
              disabled={hexBytes.length === 0}
              className="bg-gray-800/70 hover:bg-cyan-900/50 border border-gray-700 hover:border-cyan-600/60 text-cyan-300 font-bold py-1 px-2.5 rounded text-[10px] transition-all uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
              title="Select byte range by offset"
            >
              Select
            </button>
            {rangeError && (
              <span className="text-[10px] text-red-400 font-mono">{rangeError}</span>
            )}
          </div>
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

      {/* Hex content — continuous scroll with drag auto-scroll */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
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
              onMouseMove={(e) => {
                trackPointer(e);
                if (isDraggingRef.current) {
                  const byteIdx = getByteIndexAtPoint(e.clientX, e.clientY);
                  if (byteIdx !== null) onExtendSelection(byteIdx);
                }
              }}
            >
              {rows.map(({ rowBytes, absOffset }) => {
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
                            onMouseDown={(e) => handleByteMouseDown(e, absIdx)}
                            onMouseEnter={(e) => {
                              trackPointer(e);
                              if (isDraggingRef.current) onExtendSelection(absIdx);
                            }}
                            onMouseMove={trackPointer}
                            className={`w-7 text-center cursor-crosshair transition-colors duration-0
                              ${isSelected
                                ? 'text-emerald-50 rounded-sm'
                                : isDecoy
                                  ? 'bg-red-900/30 text-red-400/70'
                                  : 'hover:bg-gray-700/40 text-green-300/80'
                              }`}
                            style={isSelected ? selectedByteStyle : {}}
                          >
                            {byte}
                          </div>
                        );
                      })}
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
                              ${isSelected ? 'rounded-sm'
                                : isDecoy ? 'text-red-400/50' : ''}`}
                            style={isSelected ? selectedAsciiStyle : {}}
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
            <span>Drag, shift-click, or use Range Select</span>
          </div>
        </div>
      )}
    </div>
  );
}
