import { useRef, useState, useCallback } from 'react';

export default function IntroVideo({ onComplete }) {
  const videoRef = useRef(null);
  const [fading, setFading] = useState(false);

  const skip = useCallback(() => {
    if (fading) return;
    setFading(true);
    setTimeout(() => onComplete(), 600);
  }, [fading, onComplete]);

  const handleEnded = useCallback(() => {
    skip();
  }, [skip]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease-out',
      }}
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        playsInline
        muted={false}
        onEnded={handleEnded}
        className="w-full h-full object-contain"
        style={{ maxHeight: '100vh' }}
      />

      {/* Skip button — bottom right */}
      <button
        onClick={skip}
        className="absolute bottom-8 right-8 text-gray-500 hover:text-white text-sm font-mono tracking-wider
                   bg-black/40 hover:bg-black/70 backdrop-blur-sm px-4 py-2 rounded border border-gray-700/50
                   hover:border-gray-500/50 transition-all duration-300 uppercase"
      >
        Skip Intro ▸
      </button>

      {/* Subtle corner branding */}
      <div className="absolute top-6 left-6 text-gray-700 text-[10px] font-mono uppercase tracking-widest">
        Digital Forensics Division
      </div>
    </div>
  );
}
