export default function MainMenu({ onStart, completedLevels, totalScore }) {
  return (
    <div className="h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5"
           style={{
             backgroundImage: 'linear-gradient(rgba(74,222,128,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.3) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
           }} />

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
           style={{
             backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
           }} />

      <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
        {/* Logo */}
        <div className="mb-2">
          <div className="text-[10px] text-cyan-600/60 uppercase tracking-[0.5em] mb-3">
            Digital Forensics Division
          </div>
          <h1 className="text-5xl font-bold tracking-[0.2em] text-green-400 mb-3"
              style={{ textShadow: '0 0 20px rgba(74,222,128,0.4), 0 0 40px rgba(74,222,128,0.15)' }}>
            SHATTERED
          </h1>
          <h1 className="text-5xl font-bold tracking-[0.2em] text-green-500/80 -mt-2"
              style={{ textShadow: '0 0 20px rgba(74,222,128,0.3), 0 0 40px rgba(74,222,128,0.1)' }}>
            BYTES
          </h1>
        </div>

        <div className="w-48 h-px mx-auto bg-gradient-to-r from-transparent via-green-500/50 to-transparent mb-6" />

        <p className="text-gray-400 text-sm mb-2 max-w-md mx-auto leading-relaxed">
          A Serious Game on <span className="text-green-400 font-semibold">Data Carving</span> & Digital Forensics
        </p>
        <p className="text-gray-600 text-xs mb-8 max-w-md mx-auto">
          Master hex analysis, file signature recognition, MBR parsing, and XOR decryption
          through 4 progressive forensic investigation cases.
        </p>

        {/* Stats if returning */}
        {completedLevels.length > 0 && (
          <div className="flex items-center justify-center gap-6 mb-8 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400 tabular-nums">{totalScore}</div>
              <div className="text-[9px] text-gray-600 uppercase">Score</div>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <div className="text-lg font-bold text-green-400 tabular-nums">{completedLevels.length}/4</div>
              <div className="text-[9px] text-gray-600 uppercase">Cases</div>
            </div>
          </div>
        )}

        <button
          onClick={onStart}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3.5 px-12 rounded-lg text-sm transition-all tracking-[0.2em] uppercase"
          style={{ boxShadow: '0 0 25px rgba(74,222,128,0.2), 0 0 50px rgba(74,222,128,0.05)' }}
        >
          {completedLevels.length > 0 ? 'Continue Investigation' : 'Begin Investigation'}
        </button>

        <div className="mt-12 text-[9px] text-gray-700 space-y-1">
          <p>Computer Forensics and Cyber Crime Analysis — Serious Game Project</p>
          <p>Built with React + Python | Data Carving Educational Framework</p>
        </div>
      </div>
    </div>
  );
}
