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
      return acc;
    }, { badSelections: 0, carveAttempts: 0, hintsUsed: 0, elapsedTime: 0 });
    const partialHandled = caseResults.some(r => r.report === 'partial');
    const maxTotal = caseResults.reduce((sum, r) => sum + r.maxScore, 0);
    const masteryRatio = maxTotal > 0 ? totalScore / maxTotal : 0;
    const mastery = getMastery(masteryRatio, totals, partialHandled);
    const extraCarves = Math.max(0, totals.carveAttempts - caseResults.length);

    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-gray-900 border border-green-500/50 rounded-xl p-8 max-w-2xl w-full mx-4"
             style={{ boxShadow: '0 0 40px rgba(74,222,128,0.15)' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-400 tracking-wider mb-2">FINAL FORENSIC REPORT</h2>
            <p className="text-gray-400 text-sm mb-2">The case is complete. The score reflects method, precision, and reporting discipline.</p>
            <p className="text-xs text-cyan-400/80 mb-6 leading-relaxed">{STORY.finalReport}</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-5 border border-gray-700/50 text-center">
            <div className="text-3xl font-bold text-yellow-400 tabular-nums">{totalScore}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Total Score</div>
          </div>

          <div className="bg-gray-950/50 border border-cyan-800/40 rounded-lg p-4 mb-5">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Mastery Level</div>
            <div className={`text-xl font-bold mt-1 ${mastery.className}`}>{mastery.label}</div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{mastery.note}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              ['Signature recognition', rate(totals.badSelections, 0, 2)],
              ['Offset precision', rate(extraCarves, 0, 1)],
              ['Fragment reconstruction', caseResults.some(r => r.title.includes('Fracture')) ? 'High' : 'Medium'],
              ['Trial-and-error discipline', rate(totals.badSelections + extraCarves, 0, 2)],
              ['Obfuscation handling', caseResults.some(r => r.obfuscationHandled) ? 'High' : 'Medium'],
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

          <div className="space-y-1.5 mb-6">
            {caseResults.map(r => (
              <div key={r.levelId} className="flex justify-between gap-3 text-xs bg-gray-950/40 border border-gray-800 rounded px-3 py-2">
                <span className="text-gray-300">{r.title}</span>
                <span className="text-gray-500">
                  {r.report} | {r.score}/{r.maxScore} | {formatTime(r.elapsedTime)}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onRestart}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-sm transition-all tracking-wider"
          >
            NEW INVESTIGATION
          </button>
        </div>
      </div>
    );
  }

  if (phase !== GAME_PHASE.VICTORY) return null;

  const completedCount = objectives.filter(o => o.completed).length;
  const pct = Math.round((completedCount / objectives.length) * 100);
  const caseStatus = latestCaseResult?.status === 'partial' ? 'Partial Recovery' : 'Full Recovery';

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-green-500/30 rounded-xl p-6 max-w-md w-full mx-4"
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
  );
}
