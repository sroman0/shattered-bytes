import { useState } from 'react';

export default function Workbench({ chunks, onRemove, onMove, onCarve, onXor, levelData }) {
  const [xorInput, setXorInput] = useState('');
  const [dragIdx, setDragIdx] = useState(null);

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e, toIdx) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== toIdx) {
      onMove(dragIdx, toIdx);
    }
    setDragIdx(null);
  };

  const isXorLevel = levelData?.metadata?.xor_encoded;

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg overflow-hidden shrink-0">
      <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900">
        <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Workbench
          <span className="text-gray-600 font-normal">({chunks.length} fragments)</span>
        </h2>
      </div>

      <div className="p-3 space-y-3">
        {/* Chunk list */}
        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {chunks.length === 0 && (
            <p className="text-[10px] text-gray-600 italic text-center py-3">
              Select bytes in the Hex Editor and click "Stash" to add fragments here.
            </p>
          )}
          {chunks.map((chunk, i) => (
            <div
              key={chunk.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              className={`text-xs bg-gray-800/60 border rounded-md px-3 py-2 flex justify-between items-center group cursor-grab active:cursor-grabbing transition-all
                ${dragIdx === i ? 'border-cyan-500 opacity-50' : 'border-gray-700/50 hover:border-gray-600'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-gray-600 select-none">⠿</span>
                <span className="text-blue-400 font-bold shrink-0">FRAG_{String(i + 1).padStart(2, '0')}</span>
                <span className="text-gray-500">{chunk.size}B</span>
                <span className="text-gray-600 text-[10px] truncate">
                  [0x{chunk.start.toString(16).toUpperCase()}]
                </span>
                {chunk.opApplied && (
                  <span className="text-yellow-500 text-[10px] bg-yellow-900/30 px-1.5 py-0.5 rounded">
                    {chunk.opApplied}
                  </span>
                )}
              </div>
              <button
                onClick={() => onRemove(chunk.id)}
                className="text-red-500/50 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* XOR controls */}
        {isXorLevel && (
          <div className="border border-purple-800/40 rounded-md p-2.5 bg-purple-950/20">
            <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-2 font-bold">XOR Decryption</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={xorInput}
                onChange={(e) => setXorInput(e.target.value)}
                placeholder="Key (e.g. 0x1A or 26)"
                className="bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-purple-300 flex-1 outline-none focus:border-purple-500 transition-colors font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && xorInput.trim()) {
                    onXor(xorInput);
                    setXorInput('');
                  }
                }}
              />
              <button
                onClick={() => { onXor(xorInput); setXorInput(''); }}
                disabled={chunks.length !== 1 || !xorInput.trim()}
                className="bg-purple-800/50 hover:bg-purple-700/60 border border-purple-600/50 text-purple-300 px-3 py-1.5 rounded text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed font-bold"
              >
                DECRYPT
              </button>
            </div>
          </div>
        )}

        {/* Carve button */}
        <button
          onClick={onCarve}
          disabled={chunks.length === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-2.5 px-4 rounded-md text-xs transition-all disabled:opacity-20 disabled:cursor-not-allowed tracking-wider uppercase"
          style={{ boxShadow: chunks.length > 0 ? '0 0 15px rgba(37,99,235,0.3)' : 'none' }}
        >
          Compose & Carve
        </button>
      </div>
    </div>
  );
}
