import { CAMPAIGN, STORY } from '../data/campaign';
import titleLogo from '../../title-removebg-preview.png';

export default function MainMenu({ onStart, onHowToPlay, completedLevels, totalScore }) {
  const hasProgress = completedLevels.length > 0;

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
          <img
            src={titleLogo}
            alt="Shattered Bytes"
            className="mx-auto -my-8 w-[min(92vw,520px)] h-auto object-contain drop-shadow-[0_0_24px_rgba(34,211,238,0.22)]"
          />
        </div>

        <div className="w-48 h-px mx-auto bg-gradient-to-r from-transparent via-green-500/50 to-transparent mb-6" />

        <p className="text-cyan-500/70 text-[10px] uppercase tracking-[0.22em] mb-2">
          {STORY.operation}
        </p>
        <p className="text-gray-500 text-xs mb-3 max-w-lg mx-auto leading-relaxed">
          {STORY.premise}
        </p>
        <p className="text-gray-600 text-xs mb-8 max-w-lg mx-auto leading-relaxed">
          Take the role of {STORY.playerRole} and master hex analysis, file signatures,
          MBR parsing, and XOR decryption through {CAMPAIGN.length} linked evidence recoveries.
        </p>

        {/* Stats if returning */}
        {hasProgress && (
          <div className="flex items-center justify-center gap-6 mb-8 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400 tabular-nums">{totalScore}</div>
              <div className="text-[9px] text-gray-600 uppercase">Score</div>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <div className="text-lg font-bold text-green-400 tabular-nums">{completedLevels.length}/{CAMPAIGN.length}</div>
              <div className="text-[9px] text-gray-600 uppercase">Cases</div>
            </div>
          </div>
        )}

        {/* Menu buttons */}
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          {/* Primary: Start or Continue */}
          <button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3.5 px-12 rounded-lg text-sm transition-all tracking-[0.2em] uppercase"
            style={{ boxShadow: '0 0 25px rgba(74,222,128,0.2), 0 0 50px rgba(74,222,128,0.05)' }}
          >
            {hasProgress ? 'Continue' : 'Start Game'}
          </button>

          {/* How to Play */}
          <button
            onClick={onHowToPlay}
            className="w-full bg-gray-800/60 hover:bg-gray-700/60 text-cyan-400 hover:text-cyan-300 font-bold py-3 px-12 rounded-lg text-sm transition-all tracking-[0.15em] uppercase border border-gray-700/50 hover:border-cyan-800/50"
          >
            How to Play
          </button>

          {/* New Game (only if progress exists) */}
          {hasProgress && (
            <button
              onClick={() => {
                if (window.confirm('Start a new game? Your current progress will be lost.')) {
                  try { localStorage.removeItem('shattered_bytes_save'); } catch {}
                  window.location.reload();
                }
              }}
              className="w-full bg-transparent hover:bg-gray-800/40 text-gray-600 hover:text-gray-400 font-bold py-2.5 px-12 rounded-lg text-xs transition-all tracking-[0.15em] uppercase border border-gray-800/50 hover:border-gray-700/50"
            >
              New Game
            </button>
          )}
        </div>

        <div className="mt-10 text-[9px] text-gray-700 space-y-1">
          <p>Computer Forensics and Cyber Crime Analysis — Serious Game Project</p>
          <p>Built with React + Python | Data Carving Educational Framework</p>
        </div>
      </div>
    </div>
  );
}
