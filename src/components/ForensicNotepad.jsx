import { useState, useRef, useEffect } from 'react';

export default function ForensicNotepad({ onNoteChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setNotes(e.target.value);
    onNoteChange?.(e.target.value);
  };

  const lineCount = notes.split('\n').length;

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg overflow-hidden shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border-b border-gray-800 bg-gray-900 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <h2 className="text-xs font-bold tracking-widest text-orange-400 uppercase flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Investigator Notepad
          {notes.length > 0 && (
            <span className="text-orange-600 font-normal text-[10px]">({lineCount} lines)</span>
          )}
        </h2>
        <span className={`text-gray-600 text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="p-3">
          <div className="text-[10px] text-gray-500 mb-2 leading-relaxed">
            Use this space to note offsets, calculations, and hypotheses — like a forensic notebook.
          </div>
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={handleChange}
            placeholder="e.g.&#10;PNG header found at 0x02AA&#10;Decoy at 0x60 — no footer&#10;Key = 0x78 XOR 0x52 = 0x2A"
            className="w-full bg-gray-950/70 border border-gray-700/50 rounded-md px-3 py-2 text-xs text-orange-300/80 font-mono resize-none outline-none focus:border-orange-600/50 transition-colors placeholder-gray-700"
            rows={6}
            spellCheck={false}
          />
          {notes.length > 0 && (
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[9px] text-gray-600">{notes.length} chars</span>
              <button
                onClick={() => { setNotes(''); onNoteChange?.(''); }}
                className="text-[9px] text-red-600/50 hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
