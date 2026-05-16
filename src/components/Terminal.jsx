import { useState, useRef, useEffect } from 'react';

export default function Terminal({ logs, onCommand }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [showGuide, setShowGuide] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const commands = [
    ['help', 'Print the command list in the terminal log.'],
    ['select <a> <b>', 'Select byte range by offsets, e.g. select 0x8CE 0xA22.'],
    ['search <hex>', 'Find byte-pattern offsets, e.g. search 89504E47.'],
    ['info', 'Show metadata for the current evidence dump.'],
    ['status', 'Show objectives, hints, attempts, and time.'],
    ['hint', 'Request the next hint with score penalty.'],
    ['xorcalc <a> <b>', 'XOR two bytes to derive a key, e.g. xorcalc 0x78 0x52.'],
    ['xor <key>', 'Apply XOR to the current Workbench fragment.'],
    ['report recovered', 'Submit a complete-recovery finding.'],
    ['report partial', 'Submit a partial-recovery finding.'],
    ['clear', 'Clear the terminal output.'],
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        setHistory(prev => [input.trim(), ...prev]);
        onCommand(input);
      }
      setInput('');
      setHistoryIdx(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        const newIdx = historyIdx + 1;
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'system': return 'text-blue-400';
      case 'command': return 'text-cyan-300';
      default: return 'text-gray-400';
    }
  };

  const getLogPrefix = (type) => {
    switch (type) {
      case 'error': return '[ERR]';
      case 'success': return '[OK]';
      case 'warning': return '[!]';
      case 'system': return '[SYS]';
      case 'command': return '';
      default: return '   ';
    }
  };

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900 flex items-center justify-between shrink-0">
        <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Terminal
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuide(prev => !prev)}
            className={`text-[10px] px-2 py-1 rounded border transition-colors uppercase tracking-wider
              ${showGuide
                ? 'bg-cyan-900/40 border-cyan-600/50 text-cyan-300'
                : 'bg-gray-800/60 border-gray-700/60 text-gray-400 hover:text-cyan-300 hover:border-cyan-700/60'
              }`}
            title="Show terminal command guide"
          >
            Commands
          </button>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
        </div>
      </div>

      {showGuide && (
        <div className="shrink-0 border-b border-cyan-900/40 bg-cyan-950/20 px-3 py-2">
          <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold mb-1.5">
            Terminal Command Guide
          </div>
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            {commands.map(([command, description]) => (
              <div key={command} className="grid grid-cols-[112px_1fr] gap-2 text-[10px] leading-relaxed">
                <code className="text-green-300 bg-black/30 border border-gray-800 rounded px-1.5 py-0.5 whitespace-nowrap">
                  {command}
                </code>
                <span className="text-gray-400">{description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto p-3 text-xs font-mono space-y-0.5 bg-black/60 cursor-text min-h-0"
        onClick={() => inputRef.current?.focus()}
      >
        {logs.map((log, i) => (
          <div key={i} className={`${getLogColor(log.type)} leading-relaxed flex`}>
            {log.type !== 'command' && (
              <span className="w-12 shrink-0 text-gray-600 select-none">{getLogPrefix(log.type)}</span>
            )}
            <span className={log.type === 'command' ? 'pl-0' : ''}>{log.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="px-3 py-2 border-t border-gray-800 bg-black/40 flex items-center gap-2 shrink-0">
        <span className="text-green-500 text-xs select-none">agent@shattered:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-green-400 w-full text-xs font-mono"
          placeholder="Type a command..."
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
