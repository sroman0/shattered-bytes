import { useState, useEffect, useRef } from 'react';

const BOOT_LINES = [
  { text: 'BIOS POST ... OK', delay: 200 },
  { text: 'Memory check: 8192 MB ... passed', delay: 300 },
  { text: 'Loading forensic kernel v4.2.1-sb ...', delay: 400 },
  { text: '[  OK  ] Started SHATTERED BYTES Forensic Framework', delay: 500, style: 'text-green-400' },
  { text: '[  OK  ] Mounted forensic disk image (read-only)', delay: 300 },
  { text: '[  OK  ] Initialized hex analysis engine', delay: 250 },
  { text: '[  OK  ] Loaded file signature database (8 formats)', delay: 300 },
  { text: '[  OK  ] XOR decryption module ready', delay: 200 },
  { text: '[  OK  ] MBR partition table parser online', delay: 250 },
  { text: '[  OK  ] Evidence journal subsystem initialized', delay: 200 },
  { text: '', delay: 300 },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', delay: 100, style: 'text-green-600/50' },
  { text: '  SHATTERED BYTES - Digital Forensics Lab', delay: 200, style: 'text-green-400 font-bold' },
  { text: '  All systems operational. Welcome, Agent.', delay: 300, style: 'text-cyan-400' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', delay: 100, style: 'text-green-600/50' },
];

export default function BootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [done, setDone] = useState(false);
  const [fading, setFading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let timeout = 0;

    const showLines = async () => {
      for (let i = 0; i < BOOT_LINES.length; i++) {
        if (cancelled) return;
        await new Promise(r => setTimeout(r, BOOT_LINES[i].delay));
        if (cancelled) return;
        setVisibleLines(prev => [...prev, BOOT_LINES[i]]);
      }
      // Wait a beat, then fade out
      await new Promise(r => setTimeout(r, 800));
      if (!cancelled) {
        setDone(true);
        setFading(true);
        await new Promise(r => setTimeout(r, 600));
        if (!cancelled) onComplete();
      }
    };

    showLines();
    return () => { cancelled = true; };
  }, [onComplete]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div
      className={`fixed inset-0 bg-black z-[100] flex flex-col items-start justify-end p-8 font-mono transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
      onClick={() => { setFading(true); setTimeout(onComplete, 300); }}
    >
      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)',
        }} />

      {/* CRT glow on edges */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)',
        }} />

      <div ref={containerRef} className="relative z-10 w-full max-w-3xl overflow-y-auto max-h-[80vh]">
        {visibleLines.map((line, i) => (
          <div key={i} className={`text-sm leading-relaxed ${line.style || 'text-green-500/80'}`}>
            {line.text || '\u00A0'}
          </div>
        ))}
        {!done && (
          <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-0.5" />
        )}
      </div>

      <div className="absolute bottom-4 right-6 text-[10px] text-green-700/50">
        Click anywhere to skip
      </div>
    </div>
  );
}
