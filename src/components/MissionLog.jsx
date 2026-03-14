import { CAMPAIGN } from '../data/campaign';

export default function MissionLog({ currentLevelIdx, completedLevels, levelData, onSelectLevel, phase, GAME_PHASE }) {
  const canSelect = phase === GAME_PHASE.MENU || phase === GAME_PHASE.VICTORY || phase === GAME_PHASE.CAMPAIGN_END;

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900">
        <h2 className="text-xs font-bold tracking-widest text-green-400 uppercase flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Case Files
        </h2>
      </div>
      <div className="p-2 space-y-1.5">
        {CAMPAIGN.map((lvl, idx) => {
          const isCompleted = completedLevels.includes(idx);
          const isCurrent = currentLevelIdx === idx && levelData;
          const isLocked = !canSelect && !isCurrent;

          return (
            <button
              key={lvl.id}
              onClick={() => !isLocked && onSelectLevel(idx)}
              disabled={isLocked}
              className={`w-full text-left px-3 py-2.5 rounded-md text-xs transition-all border flex items-center gap-3 group
                ${isCurrent
                  ? 'bg-green-900/30 border-green-500/50 text-green-300'
                  : isCompleted
                    ? 'bg-gray-800/30 border-green-700/30 text-green-600'
                    : isLocked
                      ? 'bg-gray-900/30 border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-gray-800/20 hover:bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 border
                ${isCompleted
                  ? 'bg-green-900/50 border-green-600/50 text-green-400'
                  : isCurrent
                    ? 'bg-blue-900/50 border-blue-500/50 text-blue-400'
                    : 'bg-gray-800 border-gray-700 text-gray-500'
                }`}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{lvl.title}</div>
                <div className="text-[10px] text-gray-500 mt-0.5 truncate">{lvl.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
