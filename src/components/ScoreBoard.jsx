import { STORY } from '../data/campaign';

export default function ScoreBoard({
  score,
  totalScore,
  currentLevel,
  objectives,
  hintsUsed,
  elapsedTime,
  caseResults,
  latestCaseResult,
  onNext,
  onRestart,
  isLastLevel,
  phase,
  GAME_PHASE,
}) {
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const rate = (value, good, ok) => value <= good ? 'High' : value <= ok ? 'Medium' : 'Low';
  const getMastery = (ratio, totals, handledPartial) => {
    if (ratio >= 0.9 && totals.badSelections === 0 && handledPartial) {
      return {
        label: 'Forensic-ready',
        className: 'text-green-400',
        note: 'Precise byte work, disciplined validation, and calibrated reporting.',
      };
    }
    if (ratio >= 0.72 && totals.badSelections <= 2 && handledPartial) {
      return {
        label: 'Competent examiner',
        className: 'text-cyan-400',
        note: 'Solid recovery workflow with minor inefficiencies or avoidable uncertainty.',
      };
    }
    if (ratio >= 0.5) {
      return {
        label: 'Developing analyst',
        className: 'text-yellow-400',
        note: 'Core concepts are present, but the workflow still shows trial-and-error or weak reporting control.',
      };
    }
    return {
      label: 'Needs remediation',
      className: 'text-red-400',
      note: 'Evidence handling or conclusions were too imprecise for a defensible forensic workflow.',
    };
  };

  if (phase === GAME_PHASE.CAMPAIGN_END) {
    const totals = caseResults.reduce((acc, r) => {
      acc.badSelections += r.badSelections;
      acc.carveAttempts += r.carveAttempts;
      acc.hintsUsed += r.hintsUsed;
      acc.elapsedTime += r.elapsedTime;
      acc.knowledgeCorrect += r.knowledgeCorrect || 0;
      acc.knowledgeMistakes += r.knowledgeMistakes || 0;
      acc.knowledgeCheckCount += r.knowledgeCheckCount || 0;
      return acc;
    }, { badSelections: 0, carveAttempts: 0, hintsUsed: 0, elapsedTime: 0, knowledgeCorrect: 0, knowledgeMistakes: 0, knowledgeCheckCount: 0 });
    const partialHandled = caseResults.some(r => r.report === 'partial');
    const maxTotal = caseResults.reduce((sum, r) => sum + r.maxScore, 0);
    const masteryRatio = maxTotal > 0 ? totalScore / maxTotal : 0;
    const mastery = getMastery(masteryRatio, totals, partialHandled);
    const extraCarves = Math.max(0, totals.carveAttempts - caseResults.length);

    return (
      <div className="fixed inset-0 bg-black/90 z-50 backdrop-blur-sm overflow-y-auto p-3 sm:p-4">
        <div className="min-h-full flex items-start justify-center py-3">
        <div className="bg-gray-900 border border-green-500/50 rounded-xl p-4 sm:p-5 max-w-2xl w-full max-h-[calc(100vh-1.5rem)] overflow-y-auto"
             style={{ boxShadow: '0 0 40px rgba(74,222,128,0.15)' }}>
          <div className="text-center">
            <h2 className="text-xl font-bold text-green-400 tracking-wider mb-1">FINAL FORENSIC REPORT</h2>
            <p className="text-gray-400 text-xs mb-1">The case is complete. The score reflects method, precision, and reporting discipline.</p>
            <p className="text-xs text-cyan-400/80 mb-4 leading-relaxed">{STORY.finalReport}</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3 mb-3 border border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-yellow-400 tabular-nums">{totalScore}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Total Score</div>
          </div>

          <div className="bg-gray-950/50 border border-cyan-800/40 rounded-lg p-3 mb-3">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Mastery Level</div>
            <div className={`text-lg font-bold mt-1 ${mastery.className}`}>{mastery.label}</div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{mastery.note}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              ['Signature recognition', rate(totals.badSelections, 0, 2)],
              ['Offset precision', rate(extraCarves, 0, 1)],
              ['Fragment reconstruction', caseResults.some(r => r.title.includes('Fracture')) ? 'High' : 'Medium'],
              ['Trial-and-error discipline', rate(totals.badSelections + extraCarves, 0, 2)],
              ['Obfuscation handling', caseResults.some(r => r.obfuscationHandled) ? 'High' : 'Medium'],
              ['Concept assimilation', totals.knowledgeMistakes === 0 ? 'High' : totals.knowledgeMistakes <= 2 ? 'Medium' : 'Low'],
              ['Forensic reasoning', partialHandled ? 'High' : 'Medium'],
              ['Reporting quality', caseResults.every(r => ['recovered', 'partial'].includes(r.report)) ? 'High' : 'Medium'],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-950/40 border border-gray-700/40 rounded-lg px-3 py-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
                <div className={`text-sm font-bold mt-1 ${value === 'High' ? 'text-green-400' : value === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 mb-4">
            {caseResults.map(r => (
              <div key={r.levelId} className="flex justify-between gap-3 text-xs bg-gray-950/40 border border-gray-800 rounded px-3 py-1.5">
                <span className="text-gray-300 truncate">{r.title}</span>
                <span className="text-gray-500 shrink-0">
                  {r.report} | {r.score}/{r.maxScore} | KC {r.knowledgeCorrect || 0}/{r.knowledgeCheckCount || 0} | {formatTime(r.elapsedTime)}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onRestart}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-8 rounded-lg text-sm transition-all tracking-wider"
          >
            NEW INVESTIGATION
          </button>
        </div>
        </div>
      </div>
    );
  }

  if (phase !== GAME_PHASE.VICTORY) return null;

  const completedCount = objectives.filter(o => o.completed).length;
  const pct = Math.round((completedCount / objectives.length) * 100);
  const caseStatus = latestCaseResult?.status === 'partial' ? 'Partial Recovery' : 'Full Recovery';

  return (
    <div className="fixed inset-0 bg-black/85 z-50 backdrop-blur-sm overflow-y-auto p-4">
      <div className="min-h-full flex items-center justify-center">
      <div className="bg-gray-900 border border-green-500/30 rounded-xl p-5 max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto"
           style={{ boxShadow: '0 0 30px rgba(74,222,128,0.1)' }}>
        <div className="text-center mb-5">
          <div className="text-green-400 text-xs uppercase tracking-[0.3em] mb-2">Case Closed</div>
          <h2 className="text-lg font-bold text-white">{currentLevel.title}</h2>
          {latestCaseResult && (
            <p className="text-xs text-gray-500 mt-1">
              Finding accepted: <span className="text-cyan-400">{caseStatus}</span>
            </p>
          )}
        </div>

        {currentLevel.debrief && (
          <div className="bg-cyan-950/20 border border-cyan-900/40 rounded-lg px-3.5 py-3 mb-5">
            <div className="text-[9px] text-cyan-500 uppercase tracking-[0.22em] mb-1 font-bold">Investigation Update</div>
            <p className="text-xs text-gray-300 leading-relaxed">{currentLevel.debrief}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/30">
            <div className="text-xl font-bold text-yellow-400 tabular-nums">{score}</div>
            <div className="text-[9px] text-gray-500 uppercase mt-0.5">Points</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/30">
            <div className="text-xl font-bold text-cyan-400 tabular-nums">{formatTime(elapsedTime)}</div>
            <div className="text-[9px] text-gray-500 uppercase mt-0.5">Time</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/30">
            <div className="text-xl font-bold text-purple-400 tabular-nums">{hintsUsed}</div>
            <div className="text-[9px] text-gray-500 uppercase mt-0.5">Hints</div>
          </div>
        </div>

        {latestCaseResult && (
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg px-3.5 py-3 mb-5">
            <div className="text-[9px] text-amber-500 uppercase tracking-[0.22em] mb-1 font-bold">Concept Assimilation</div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Knowledge checks passed: <span className="text-amber-300 font-bold">{latestCaseResult.knowledgeCorrect || 0}/{latestCaseResult.knowledgeCheckCount || 0}</span>
              {' '}with <span className={latestCaseResult.knowledgeMistakes ? 'text-red-300 font-bold' : 'text-green-300 font-bold'}>{latestCaseResult.knowledgeMistakes || 0}</span> retry penalty.
            </p>
          </div>
        )}

        {/* Objectives recap */}
        <div className="mb-5 space-y-1.5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Objectives ({pct}%)
          </div>
          {objectives.map(o => (
            <div key={o.id} className="flex items-center gap-2 text-xs">
              <span className={o.completed ? 'text-green-500' : 'text-red-500'}>{o.completed ? '✓' : '✗'}</span>
              <span className={o.completed ? 'text-gray-300' : 'text-gray-600'}>{o.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-lg text-sm transition-all tracking-wider uppercase"
        >
          {isLastLevel ? 'View Final Report' : 'Next Case'}
        </button>
      </div>
      </div>
    </div>
  );
}
