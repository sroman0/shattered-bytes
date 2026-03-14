export default function ObjectivesPanel({ objectives, onHint, hintsUsed, currentLevel }) {
  const completedCount = objectives.filter(o => o.completed).length;
  const totalCount = objectives.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest text-yellow-400 uppercase flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Objectives
        </h2>
        <span className="text-[10px] text-gray-500 font-mono">{pct}%</span>
      </div>

      <div className="p-3 space-y-2">
        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Objective list */}
        <div className="space-y-1.5">
          {objectives.map((obj) => (
            <div key={obj.id} className={`flex items-start gap-2 text-xs transition-all ${obj.completed ? 'opacity-60' : ''}`}>
              <span className={`shrink-0 mt-0.5 w-4 h-4 rounded flex items-center justify-center text-[10px] border
                ${obj.completed
                  ? 'bg-green-900/40 border-green-600/50 text-green-400'
                  : 'bg-gray-800 border-gray-700 text-gray-600'
                }`}>
                {obj.completed ? '✓' : '○'}
              </span>
              <span className={obj.completed ? 'text-green-600 line-through' : 'text-gray-400'}>{obj.text}</span>
            </div>
          ))}
        </div>

        {/* Hint button */}
        <button
          onClick={onHint}
          className="w-full mt-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-400 hover:text-yellow-400 py-1.5 px-3 rounded text-[10px] transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <span>💡</span>
          Request Hint
          <span className="text-gray-600">({hintsUsed}/{currentLevel.hints.length} used, -15pts each)</span>
        </button>
      </div>
    </div>
  );
}
