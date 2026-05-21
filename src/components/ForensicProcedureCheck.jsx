export default function ForensicProcedureCheck({ check, onAnswer, onContinue }) {
  if (!check) return null;

  return (
    <div className="fixed inset-0 z-[61] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl bg-gray-950 border border-cyan-800/50 rounded-xl overflow-hidden shadow-2xl"
        style={{ boxShadow: '0 0 35px rgba(8, 145, 178, 0.16)' }}
      >
        <div className="px-5 py-3 border-b border-cyan-900/40 bg-cyan-950/20">
          <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-500 font-bold">
            Forensic Procedure Check
          </div>
          <h2 className="text-base text-gray-100 font-bold mt-1">{check.title}</h2>
        </div>

        <div className="px-5 py-4 space-y-4">
          {check.context && (
            <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-cyan-800/50 pl-3">
              {check.context}
            </p>
          )}

          <p className="text-sm text-gray-200 leading-relaxed">{check.question}</p>

          <div className="space-y-2">
            {check.options.map((option, idx) => {
              const disabled = check.resolved;
              const isCorrectOption = check.resolved && option.correct === true;
              return (
                <button
                  key={option.text}
                  type="button"
                  disabled={disabled}
                  onClick={() => onAnswer(idx)}
                  className={`w-full text-left rounded-lg border px-3.5 py-3 text-xs leading-relaxed transition-all
                    ${isCorrectOption
                      ? 'border-green-600/60 bg-green-950/30 text-green-200'
                      : 'border-gray-800 bg-gray-900/80 text-gray-300 hover:border-cyan-700/60 hover:bg-cyan-950/20'
                    }
                    ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="text-cyan-500 font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option.text}
                </button>
              );
            })}
          </div>

          {check.feedback && (
            <div
              className={`rounded-lg border px-3.5 py-3 text-xs leading-relaxed
                ${check.lastCorrect
                  ? 'border-green-700/40 bg-green-950/20 text-green-200'
                  : 'border-red-800/50 bg-red-950/20 text-red-200'
                }`}
            >
              <div className="text-[10px] uppercase tracking-wider font-bold mb-1">
                {check.lastCorrect ? 'Procedure accepted' : 'Procedure risk'}
              </div>
              {check.feedback}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 text-[10px] text-gray-500">
            <span>Attempts: <span className="text-cyan-400">{check.attempts}</span></span>
            <span>Wrong answers affect procedure discipline</span>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-900 border-t border-gray-800 flex justify-end">
          <button
            type="button"
            disabled={!check.resolved}
            onClick={onContinue}
            className="bg-cyan-700/70 hover:bg-cyan-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-cyan-50 font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors"
          >
            Continue Investigation
          </button>
        </div>
      </div>
    </div>
  );
}
