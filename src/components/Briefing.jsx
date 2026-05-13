import { useState } from 'react';
import { KNOWN_SIGNATURES } from '../data/campaign';

export default function Briefing({ level, onStart }) {
  const concept = level.forensicConcept;
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-cyan-800/40 rounded-xl w-full max-w-2xl flex flex-col"
           style={{ boxShadow: '0 0 40px rgba(6,182,212,0.1)', maxHeight: 'calc(100vh - 2rem)' }}>

        {/* Header — compact */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-gray-900 px-5 py-3 border-b border-cyan-800/30 shrink-0">
          <div className="text-[10px] text-cyan-600 uppercase tracking-[0.3em] mb-0.5">Mission Briefing</div>
          <h2 className="text-base font-bold text-white">{level.title}</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">{level.subtitle}</p>
        </div>

        {/* Tab switcher */}
        {concept && (
          <div className="flex border-b border-gray-800 shrink-0">
            <button
              onClick={() => setActiveTab('mission')}
              className={`flex-1 px-4 py-2 text-[10px] uppercase tracking-wider font-bold transition-all ${
                activeTab === 'mission'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              📋 Mission Brief
            </button>
            <button
              onClick={() => setActiveTab('concept')}
              className={`flex-1 px-4 py-2 text-[10px] uppercase tracking-wider font-bold transition-all ${
                activeTab === 'concept'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-950/20'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              📖 Forensic Concept
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
          {/* Tab: Mission Brief */}
          {activeTab === 'mission' && (
            <>
              <div className="space-y-2 mb-4">
                {level.briefing.map((line, i) => (
                  <p key={i} className="text-[13px] text-gray-300 leading-relaxed">{line}</p>
                ))}
              </div>

              {/* Objectives */}
              <div className="bg-gray-800/40 rounded-lg p-3.5 border border-gray-700/30 mb-4">
                <div className="text-[9px] text-yellow-500 uppercase tracking-wider mb-2 font-bold">Objectives</div>
                <div className="space-y-1.5">
                  {level.objectives.map((obj, i) => (
                    <div key={obj.id} className="flex items-start gap-2 text-[11px]">
                      <span className="text-gray-600 bg-gray-800 rounded w-4 h-4 flex items-center justify-center shrink-0 text-[9px] font-mono border border-gray-700 mt-px">
                        {i + 1}
                      </span>
                      <span className="text-gray-400">{obj.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab: Forensic Concept */}
          {activeTab === 'concept' && concept && (
            <>
              <div className="bg-gradient-to-br from-emerald-950/30 to-gray-900 border border-emerald-800/30 rounded-lg p-4 mb-4">
                <div className="text-[10px] text-emerald-400 uppercase tracking-[0.2em] mb-2 font-bold flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {concept.title}
                </div>
                <div className="space-y-2">
                  {concept.paragraphs.map((p, i) => (
                    <p key={i} className="text-xs text-gray-400 leading-relaxed">{p}</p>
                  ))}
                </div>

                {/* Key Signatures */}
                {concept.keySignatures && concept.keySignatures.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-900/30">
                    <div className="text-[9px] text-emerald-600 uppercase tracking-wider mb-1.5 font-bold">Key Signatures</div>
                    <div className="flex gap-2 flex-wrap">
                      {concept.keySignatures.map((sigKey) => {
                        const sig = KNOWN_SIGNATURES[sigKey.toLowerCase()];
                        if (!sig) return null;
                        return (
                          <div key={sigKey} className="bg-gray-950/50 border border-gray-800/50 rounded px-2.5 py-1.5 text-[10px] font-mono">
                            <span className="text-amber-400 mr-2">{sig.name}</span>
                            <span className="text-green-400/70">{sig.header}</span>
                            {sig.footer && (
                              <>
                                <span className="text-gray-600 mx-1">…</span>
                                <span className="text-red-400/60">{sig.footer}</span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer — always visible */}
        <div className="px-5 py-3 bg-gray-950/50 border-t border-gray-800 shrink-0">
          <div className="flex items-center justify-between text-[10px] text-gray-500 mb-3">
            <span>Max score: <span className="text-yellow-400 font-bold">{level.maxScore}</span> pts</span>
            <span>Time bonus: <span className="text-cyan-400">{level.timeBonusThreshold}s</span></span>
            <span>Hint: <span className="text-red-400">-15 pts</span></span>
          </div>
          <button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition-all tracking-wider uppercase"
            style={{ boxShadow: '0 0 20px rgba(6,182,212,0.2)' }}
          >
            Begin Investigation
          </button>
        </div>
      </div>
    </div>
  );
}
