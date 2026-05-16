import { useRef, useState, useCallback, useEffect } from 'react';

export default function IntroVideo({ onComplete }) {
  const videoRef = useRef(null);
  const completionRef = useRef(false);
  const retryRef = useRef(null);
  const [fading, setFading] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const finish = useCallback((skipped = false) => {
    if (completionRef.current) return;
    completionRef.current = true;
    if (retryRef.current) window.clearTimeout(retryRef.current);
    setFading(true);
    setTimeout(() => onComplete({ skipped }), 600);
  }, [onComplete]);

  const attemptPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || completionRef.current || fading) return;

    try {
      video.muted = true;
      video.playsInline = true;
      const result = video.play();
      if (result) await result;
      if (completionRef.current) return;
      setNeedsGesture(false);
      setBuffering(false);
    } catch {
      if (completionRef.current) return;
      setNeedsGesture(true);
      setBuffering(false);
    }
  }, [fading]);

  const retrySoon = useCallback(() => {
    if (completionRef.current) return;
    setBuffering(true);
    if (retryRef.current) window.clearTimeout(retryRef.current);
    retryRef.current = window.setTimeout(attemptPlay, 300);
  }, [attemptPlay]);

  const skip = useCallback(() => {
    finish(true);
  }, [finish]);

  const handleEnded = useCallback(() => {
    finish(false);
  }, [finish]);

  useEffect(() => {
    const firstAttempt = window.setTimeout(attemptPlay, 100);
    const stuckGuard = window.setTimeout(() => {
      const video = videoRef.current;
      if (video && !video.ended && (video.paused || video.currentTime < 0.12)) {
        attemptPlay();
      }
    }, 900);

    return () => {
      window.clearTimeout(firstAttempt);
      window.clearTimeout(stuckGuard);
      if (retryRef.current) window.clearTimeout(retryRef.current);
    };
  }, [attemptPlay]);

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
        muted
        preload="auto"
        onLoadedData={attemptPlay}
        onCanPlay={attemptPlay}
        onPlaying={() => {
          setNeedsGesture(false);
          setBuffering(false);
        }}
        onWaiting={retrySoon}
        onStalled={retrySoon}
        onPause={() => {
          const video = videoRef.current;
          if (video && !video.ended && !completionRef.current) {
            retrySoon();
          }
        }}
        onEnded={handleEnded}
        onError={() => setNeedsGesture(true)}
        className="w-full h-full object-contain"
        style={{ maxHeight: '100vh' }}
      />

      {needsGesture && (
        <button
          type="button"
          onClick={attemptPlay}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     bg-green-500/15 hover:bg-green-500/25 text-green-300 border border-green-500/50
                     px-5 py-3 rounded-md text-xs font-mono uppercase tracking-[0.22em]
                     transition-colors"
        >
          Play Intro
        </button>
      )}

      {buffering && !needsGesture && (
        <div className="absolute bottom-8 left-8 text-gray-600 text-[10px] font-mono uppercase tracking-widest">
          Synchronizing feed...
        </div>
      )}

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
