import { useState } from 'react';
import { KNOWN_SIGNATURES } from '../data/campaign';

export default function SignatureReference() {
  const [isOpen, setIsOpen] = useState(false);

  const entries = Object.entries(KNOWN_SIGNATURES);

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg overflow-hidden shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border-b border-gray-800 bg-gray-900 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Signature Reference
        </h2>
        <span className={`text-gray-600 text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="p-3">
          <div className="text-[10px] text-gray-500 mb-2 leading-relaxed">
            Known file signatures and cleartext markers used in forensic carving. Match header <em>and</em> footer where available.
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {entries.map(([key, sig]) => (
              <div
                key={key}
                className="bg-gray-950/60 border border-gray-800/60 rounded-md px-3 py-2 text-[10px]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-amber-300 font-bold uppercase tracking-wider">{sig.name}</span>
                  <span className="text-gray-600">.{key}</span>
                </div>
                <div className="grid grid-cols-[50px_1fr] gap-1 text-gray-400 font-mono">
                  <span className="text-gray-600">HDR</span>
                  <span className="text-green-400/80 select-all">{sig.header || '—'}</span>
                  <span className="text-gray-600">FTR</span>
                  <span className="text-red-400/70 select-all">{sig.footer || '—'}</span>
                </div>
                {sig.description && (
                  <div className="text-gray-600 mt-1 leading-snug">{sig.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
