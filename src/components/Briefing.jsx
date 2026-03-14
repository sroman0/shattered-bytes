export default function Briefing({ level, onStart }) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-cyan-800/40 rounded-xl max-w-2xl w-full mx-4 overflow-hidden"
           style={{ boxShadow: '0 0 40px rgba(6,182,212,0.1)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-gray-900 px-6 py-4 border-b border-cyan-800/30">
          <div className="text-[10px] text-cyan-600 uppercase tracking-[0.3em] mb-1">Mission Briefing</div>
          <h2 className="text-lg font-bold text-white">{level.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{level.subtitle}</p>
        </div>

        {/* Briefing text */}
        <div className="px-6 py-5">
          <div className="space-y-2.5 mb-6">
            {level.briefing.map((line, i) => (
              <p key={i} className="text-sm text-gray-300 leading-relaxed">
                {line}
              </p>
            ))}
          </div>

          {/* Objectives */}
          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30 mb-6">
            <div className="text-[10px] text-yellow-500 uppercase tracking-wider mb-3 font-bold">Objectives</div>
            <div className="space-y-2">
              {level.objectives.map((obj, i) => (
                <div key={obj.id} className="flex items-start gap-2.5 text-xs">
                  <span className="text-gray-600 bg-gray-800 rounded w-5 h-5 flex items-center justify-center shrink-0 text-[10px] font-mono border border-gray-700">
                    {i + 1}
                  </span>
                  <span className="text-gray-400">{obj.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score info */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 mb-5">
            <span>Max score: <span className="text-yellow-400 font-bold">{level.maxScore}</span> pts</span>
            <span>Time bonus threshold: <span className="text-cyan-400">{level.timeBonusThreshold}s</span></span>
            <span>Hint penalty: <span className="text-red-400">-15 pts</span> each</span>
          </div>
        </div>

        {/* Start button */}
        <div className="px-6 py-4 bg-gray-950/50 border-t border-gray-800">
          <button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg text-sm transition-all tracking-wider uppercase"
            style={{ boxShadow: '0 0 20px rgba(6,182,212,0.2)' }}
          >
            Begin Investigation
          </button>
        </div>
      </div>
    </div>
  );
}
