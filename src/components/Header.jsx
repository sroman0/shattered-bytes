import { useState } from 'react';

export default function Header({ totalScore, elapsedTime, phase, GAME_PHASE, objectives, onReturnToTitle, onSettings }) {
  const [showSettings, setShowSettings] = useState(false);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const completedCount = objectives ? objectives.filter(o => o.completed).length : 0;
  const totalObjectives = objectives ? objectives.length : 0;

  return (
    <>
      <header className="w-full flex-shrink-0 flex justify-between items-center px-6 py-3 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-b border-green-500/30">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-[0.3em] text-green-400 leading-tight"
              style={{ textShadow: '0 0 10px rgba(74,222,128,0.5), 0 0 20px rgba(74,222,128,0.2)' }}>
              SHATTERED_BYTES
            </h1>
            <p className="text-[10px] text-green-600/80 tracking-[0.2em] uppercase">
              Digital Forensics Investigation Game
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Objectives progress */}
          {phase === GAME_PHASE.PLAYING && totalObjectives > 0 && (
            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded border border-gray-700/50">
              <span className="text-[10px] text-gray-500 uppercase">Objectives</span>
              <span className="text-sm font-mono text-cyan-400 tabular-nums">{completedCount}/{totalObjectives}</span>
              <div className="flex gap-0.5 ml-1">
                {objectives.map((obj, i) => (
                  <div
                    key={obj.id || i}
                    className={`w-1.5 h-3 rounded-sm transition-all duration-500 ${
                      obj.completed
                        ? 'bg-cyan-400'
                        : 'bg-gray-700'
                    }`}
                    style={obj.completed ? { boxShadow: '0 0 4px rgba(6,182,212,0.6)' } : {}}
                  />
                ))}
              </div>
            </div>
          )}

          {phase === GAME_PHASE.PLAYING && (
            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded border border-gray-700/50">
              <span className="text-[10px] text-gray-500 uppercase">Elapsed</span>
              <span className="text-sm font-mono text-cyan-400 tabular-nums">{formatTime(elapsedTime)}</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded border border-gray-700/50">
            <span className="text-[10px] text-gray-500 uppercase">Score</span>
            <span className="text-sm font-mono text-yellow-400 tabular-nums">{totalScore}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-600">OPERATOR</span>
            <span className="text-xs font-bold text-blue-400">AGENT_ROOT</span>
          </div>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-8 h-8 flex items-center justify-center rounded bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600/60 transition-all text-gray-500 hover:text-gray-300"
            title="Settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
            style={{ boxShadow: '0 0 8px rgba(74,222,128,0.8)' }} />
        </div>
      </header>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="absolute right-6 top-14 z-50 bg-gray-900 border border-gray-700/60 rounded-lg shadow-2xl overflow-hidden min-w-[220px]"
             style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          <div className="px-4 py-2.5 border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
            Settings
          </div>

          {/* Return to Title */}
          <button
            onClick={() => {
              setShowSettings(false);
              if (onReturnToTitle) {
                if (window.confirm('Return to the main menu? Progress on the current case will be lost, but completed cases and score are preserved.')) {
                  onReturnToTitle();
                }
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-all border-b border-gray-800/50"
          >
            <svg className="w-4 h-4 text-cyan-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
            Return to Title
          </button>

          {/* How to Play (from settings) */}
          {onSettings && (
            <button
              onClick={() => {
                setShowSettings(false);
                onSettings('tutorial');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-all border-b border-gray-800/50"
            >
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Play
            </button>
          )}

          {/* Clear save data */}
          <button
            onClick={() => {
              setShowSettings(false);
              if (window.confirm('Delete all saved progress? This cannot be undone.')) {
                try {
                  localStorage.removeItem('shattered_bytes_save');
                  localStorage.removeItem('shattered_bytes_tutorial_seen');
                } catch { /* ignore */ }
                window.location.reload();
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-400/80 hover:bg-red-950/30 hover:text-red-300 transition-all"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Save Data
          </button>
        </div>
      )}
    </>
  );
}
