export default function EvidenceJournal({ entries, badSelections, carveAttempts, pendingCaseResult }) {
  const verdictClass = {
    valid: 'text-green-400 border-green-700/40 bg-green-950/20',
    partial: 'text-yellow-400 border-yellow-700/40 bg-yellow-950/20',
    decoy: 'text-orange-400 border-orange-700/40 bg-orange-950/20',
    unsupported: 'text-red-400 border-red-700/40 bg-red-950/20',
    overlap: 'text-cyan-400 border-cyan-700/40 bg-cyan-950/20',
  };

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg overflow-hidden shrink-0">
      <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Evidence Journal</h2>
        <span className="text-[10px] text-gray-500">{entries.length} notes</span>
      </div>

      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-gray-800/50 border border-gray-700/40 rounded px-2 py-1.5">
            <span className="text-gray-500">Bad leads</span>
            <span className="float-right text-red-400 font-bold">{badSelections}</span>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/40 rounded px-2 py-1.5">
            <span className="text-gray-500">Carve attempts</span>
            <span className="float-right text-cyan-400 font-bold">{carveAttempts}</span>
          </div>
        </div>

        {pendingCaseResult && (
          <div className="text-[10px] border border-yellow-700/40 bg-yellow-950/20 text-yellow-300 rounded px-2 py-2 leading-relaxed">
            Payload carved. Submit final conclusion in terminal: <span className="font-bold">report {pendingCaseResult.expectedReport}</span>
          </div>
        )}

        <div className="space-y-1.5 max-h-44 overflow-y-auto">
          {entries.length === 0 && (
            <p className="text-[10px] text-gray-600 italic text-center py-3">
              Stashed ranges will be assessed here as evidence, decoys, or unsupported selections.
            </p>
          )}

          {entries.map((entry, idx) => (
            <div
              key={entry.id}
              className={`border rounded-md px-2.5 py-2 text-[10px] leading-relaxed ${verdictClass[entry.verdict] || verdictClass.unsupported}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold uppercase tracking-wider">Item {String(idx + 1).padStart(2, '0')}</span>
                <span>{entry.size}B</span>
              </div>
              <div className="font-mono text-gray-300">
                0x{entry.start.toString(16).toUpperCase()} - 0x{entry.end.toString(16).toUpperCase()}
              </div>
              <div className="mt-1 text-gray-400">{entry.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
