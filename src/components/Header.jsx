export default function Header({ totalScore, elapsedTime, phase, GAME_PHASE }) {
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full flex-shrink-0 flex justify-between items-center px-6 py-3 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-b border-green-500/30">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-[0.3em] text-green-400 leading-tight"
              style={{ textShadow: '0 0 10px rgba(74,222,128,0.5), 0 0 20px rgba(74,222,128,0.2)' }}>
            SHATTERED_BYTES
          </h1>
          <p className="text-[10px] text-green-600/80 tracking-[0.2em] uppercase">
            Digital Forensics Investigation Framework
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
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

        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
             style={{ boxShadow: '0 0 8px rgba(74,222,128,0.8)' }} />
      </div>
    </header>
  );
}
