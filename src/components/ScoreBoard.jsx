export default function ScoreBoard({ score, totalScore, currentLevel, objectives, hintsUsed, elapsedTime, onNext, onRestart, isLastLevel, phase, GAME_PHASE }) {
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (phase === GAME_PHASE.CAMPAIGN_END) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-gray-900 border border-green-500/50 rounded-xl p-8 max-w-lg w-full mx-4 text-center"
             style={{ boxShadow: '0 0 40px rgba(74,222,128,0.15)' }}>
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-green-400 tracking-wider mb-2">CAMPAIGN COMPLETE</h2>
          <p className="text-gray-400 text-sm mb-6">All forensic cases have been successfully closed.</p>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700/50">
            <div className="text-3xl font-bold text-yellow-400 tabular-nums">{totalScore}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Total Score</div>
          </div>

          <div className="text-xs text-gray-500 mb-6">
            Your analytical skills have proven invaluable to the Digital Forensics Division.
          </div>

          <button
            onClick={onRestart}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-sm transition-all tracking-wider"
          >
            NEW INVESTIGATION
          </button>
        </div>
      </div>
    );
  }

  if (phase !== GAME_PHASE.VICTORY) return null;

  const completedCount = objectives.filter(o => o.completed).length;
  const pct = Math.round((completedCount / objectives.length) * 100);

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-green-500/30 rounded-xl p-6 max-w-md w-full mx-4"
           style={{ boxShadow: '0 0 30px rgba(74,222,128,0.1)' }}>
        <div className="text-center mb-5">
          <div className="text-green-400 text-xs uppercase tracking-[0.3em] mb-2">Case Closed</div>
          <h2 className="text-lg font-bold text-white">{currentLevel.title}</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/30">
            <div className="text-xl font-bold text-yellow-400 tabular-nums">{score}</div>
            <div className="text-[9px] text-gray-500 uppercase mt-0.5">Points</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/30">
            <div className="text-xl font-bold text-cyan-400 tabular-nums">{formatTime(elapsedTime)}</div>
            <div className="text-[9px] text-gray-500 uppercase mt-0.5">Time</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/30">
            <div className="text-xl font-bold text-purple-400 tabular-nums">{hintsUsed}</div>
            <div className="text-[9px] text-gray-500 uppercase mt-0.5">Hints</div>
          </div>
        </div>

        {/* Objectives recap */}
        <div className="mb-5 space-y-1.5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Objectives ({pct}%)
          </div>
          {objectives.map(o => (
            <div key={o.id} className="flex items-center gap-2 text-xs">
              <span className={o.completed ? 'text-green-500' : 'text-red-500'}>{o.completed ? '✓' : '✗'}</span>
              <span className={o.completed ? 'text-gray-300' : 'text-gray-600'}>{o.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-lg text-sm transition-all tracking-wider uppercase"
        >
          {isLastLevel ? 'View Final Report' : 'Next Case'}
        </button>
      </div>
    </div>
  );
}
