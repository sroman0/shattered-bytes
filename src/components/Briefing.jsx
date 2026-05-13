import { KNOWN_SIGNATURES } from '../data/campaign';

export default function Briefing({ level, onStart }) {
  const concept = level.forensicConcept;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-gray-900 border border-cyan-800/40 rounded-xl max-w-2xl w-full mx-4 overflow-hidden"
           style={{ boxShadow: '0 0 40px rgba(6,182,212,0.1)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-gray-900 px-6 py-4 border-b border-cyan-800/30">
          <div className="text-[10px] text-cyan-600 uppercase tracking-[0.3em] mb-1">Mission Briefing</div>
          <h2 className="text-lg font-bold text-white">{level.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{level.subtitle}</p>
        </div>

        {/* Forensic Concept (educational section) */}
        {concept && (
          <div className="px-6 pt-5 pb-2">
            <div className="bg-gradient-to-br from-emerald-950/30 to-gray-900 border border-emerald-800/30 rounded-lg p-4">
              <div className="text-[10px] text-emerald-400 uppercase tracking-[0.2em] mb-2 font-bold flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Forensic Concept — {concept.title}
              </div>
              <div className="space-y-2">
                {concept.paragraphs.map((p, i) => (
                  <p key={i} className="text-xs text-gray-400 leading-relaxed">{p}</p>
                ))}
              </div>

              {/* Show relevant signatures if any */}
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
          </div>
        )}

        {/* Briefing text */}
        <div className="px-6 py-5">
          <div className="text-[10px] text-cyan-600 uppercase tracking-wider mb-2 font-bold">Case Description</div>
          <div className="space-y-2.5 mb-6">
            {level.briefing.map((line, i) => (
              <p key={i} className="text-sm text-gray-300 leading-relaxed">
                {line}
              </p>
            ))}
          </div>

          {/* Objectives */}
          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30 mb-6">
            <div className="text-[10px] text-yellow-500 uppercase tracking-wider mb-3 font-bold">Objectives</div>
            <div className="space-y-2">
              {level.objectives.map((obj, i) => (
                <div key={obj.id} className="flex items-start gap-2.5 text-xs">
                  <span className="text-gray-600 bg-gray-800 rounded w-5 h-5 flex items-center justify-center shrink-0 text-[10px] font-mono border border-gray-700">
                    {i + 1}
                  </span>
                  <span className="text-gray-400">{obj.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score info */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 mb-5">
            <span>Max score: <span className="text-yellow-400 font-bold">{level.maxScore}</span> pts</span>
            <span>Time bonus threshold: <span className="text-cyan-400">{level.timeBonusThreshold}s</span></span>
            <span>Hint penalty: <span className="text-red-400">-15 pts</span> each</span>
          </div>
        </div>

        {/* Start button */}
        <div className="px-6 py-4 bg-gray-950/50 border-t border-gray-800">
          <button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg text-sm transition-all tracking-wider uppercase"
            style={{ boxShadow: '0 0 20px rgba(6,182,212,0.2)' }}
          >
            Begin Investigation
          </button>
        </div>
      </div>
    </div>
  );
}
