/**
 * CyberForensics: Digital Detective
 * Core Game Engine
 *
 * Responsibilities:
 *  - Screen transitions
 *  - Scenario loading and rendering
 *  - Question/answer logic with feedback
 *  - Scoring system
 *  - Progress persistence (sessionStorage)
 */

'use strict';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const POINTS_CORRECT   = 100;
const POINTS_INCORRECT = 0;
const TOTAL_SCENARIOS  = SCENARIOS.length;

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
const state = {
  totalScore: 0,
  currentScenarioIdx: null,   // index into SCENARIOS array
  currentQuestionIdx: 0,
  scenarioScores: {},          // { scenarioId: { score, max, completed } }
  answeredQuestions: new Set() // track answered question indices per scenario
};

/* ─────────────────────────────────────────
   DOM HELPERS
───────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function show(screen) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  const el = typeof screen === 'string' ? document.getElementById(screen) : screen;
  if (el) el.classList.add('active');
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* ─────────────────────────────────────────
   INITIALIZATION
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderTitleTopics();
  bindTitleButtons();
  show('screen-title');
});

function loadState() {
  try {
    const saved = sessionStorage.getItem('cfca_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.totalScore = parsed.totalScore || 0;
      state.scenarioScores = parsed.scenarioScores || {};
      // Re-build Set (JSON doesn't serialize Set)
      state.answeredQuestions = new Set(parsed.answeredQuestions || []);
    }
  } catch (_) { /* ignore */ }
}

function saveState() {
  try {
    sessionStorage.setItem('cfca_state', JSON.stringify({
      totalScore: state.totalScore,
      scenarioScores: state.scenarioScores,
      answeredQuestions: Array.from(state.answeredQuestions)
    }));
  } catch (_) { /* ignore */ }
}

/* ─────────────────────────────────────────
   TITLE SCREEN
───────────────────────────────────────── */
function renderTitleTopics() {
  const container = document.getElementById('title-topics-container');
  if (!container) return;
  const topics = SCENARIOS.map(s => s.topic);
  container.innerHTML = topics
    .map(t => `<span class="topic-badge">${t}</span>`)
    .join('');
}

function bindTitleButtons() {
  const btnStart = document.getElementById('btn-start');
  const btnResume = document.getElementById('btn-resume');
  if (btnStart) btnStart.addEventListener('click', () => startGame(false));
  if (btnResume) {
    const hasProgress = Object.keys(state.scenarioScores).length > 0;
    if (hasProgress) {
      btnResume.classList.remove('hidden');
      btnResume.addEventListener('click', () => startGame(true));
    }
  }
}

function startGame(resume) {
  if (!resume) {
    // Reset all progress
    state.totalScore = 0;
    state.scenarioScores = {};
    state.answeredQuestions = new Set();
    saveState();
  }
  renderMap();
  show('screen-map');
}

/* ─────────────────────────────────────────
   SCENARIO MAP (level selector)
───────────────────────────────────────── */
function renderMap() {
  updateHeaderScore();
  const grid = document.getElementById('scenarios-grid');
  if (!grid) return;

  grid.innerHTML = SCENARIOS.map((s, i) => {
    const scoreData = state.scenarioScores[s.id];
    const completed = scoreData && scoreData.completed;
    const stars = completed ? getStars(scoreData.score, scoreData.max) : 0;
    const cardStyle = `--card-accent: ${s.accentColor};`;

    return `
      <div class="scenario-card${completed ? ' completed' : ''}"
           style="${cardStyle}"
           data-idx="${i}"
           role="button"
           tabindex="0"
           aria-label="Scenario ${i + 1}: ${s.title}">
        <div class="scenario-number">Case #${String(i + 1).padStart(2, '0')}</div>
        <span class="scenario-icon">${s.icon}</span>
        <div class="scenario-name">${escapeHtml(s.title)}</div>
        <div class="scenario-topic">${escapeHtml(s.topic)}</div>
        <div class="scenario-desc">${escapeHtml(s.description)}</div>
        <div class="scenario-stars">
          ${[1,2,3].map(n => `<span${n <= stars ? ' class="earned"' : ''}>⭐</span>`).join('')}
        </div>
        ${completed ? `<div class="font-mono" style="font-size:0.75rem;color:${s.accentColor};margin-top:0.5rem">${scoreData.score}/${scoreData.max} pts</div>` : ''}
      </div>`;
  }).join('');

  // Bind click events
  $$('.scenario-card', grid).forEach(card => {
    const activate = () => {
      const idx = parseInt(card.dataset.idx, 10);
      loadScenario(idx);
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') activate(); });
  });
}

function getStars(score, max) {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (pct > 0)    return 1;
  return 0;
}

/* ─────────────────────────────────────────
   LOAD & RENDER SCENARIO
───────────────────────────────────────── */
function loadScenario(idx) {
  state.currentScenarioIdx = idx;
  state.currentQuestionIdx = 0;
  state.answeredQuestions = new Set();

  const scenario = SCENARIOS[idx];
  const scoreData = state.scenarioScores[scenario.id];

  // Apply accent colour as CSS custom property
  document.documentElement.style.setProperty('--card-accent', scenario.accentColor);

  // Header
  setText('scene-icon', scenario.icon);
  setText('scene-title-text', scenario.title);
  setHTML('scene-topic-tag', `<span class="scene-topic-tag">${escapeHtml(scenario.topic)}</span>`);

  // Narrative
  const narrativeEl = document.getElementById('narrative-box');
  if (narrativeEl) {
    narrativeEl.innerHTML = scenario.narrative
      .map(p => `<p>${escapeHtml(p)}</p>`)
      .join('');
  }

  // Evidence list (sidebar)
  const evidenceList = document.getElementById('evidence-list');
  if (evidenceList) {
    evidenceList.innerHTML = scenario.evidence
      .map(e => `<div class="evidence-item">
        <span class="evidence-icon">${e.icon}</span>
        <span class="evidence-text">${escapeHtml(e.text)}</span>
      </div>`)
      .join('');
  }

  // Terminal / artifact viewer
  const terminalTitle = document.getElementById('terminal-title');
  const terminalContent = document.getElementById('terminal-content');
  if (terminalTitle) terminalTitle.textContent = scenario.terminalLabel;
  if (terminalContent) terminalContent.innerHTML = scenario.terminalContent;

  // Hint
  const hintBox = document.getElementById('hint-box');
  if (hintBox) hintBox.textContent = `💡 ${scenario.hint}`;

  // Progress steps
  renderProgressSteps(scenario, 0);

  // Reset per-scenario score display
  updateScoreDisplay(0, scenario.questions.length * POINTS_CORRECT);

  // Render first question
  renderQuestion(scenario, 0);

  // Update case counter
  setText('hdr-case', `${idx + 1}/${TOTAL_SCENARIOS}`);

  updateHeaderScore();
  show('screen-game');
}

/* ─────────────────────────────────────────
   QUESTION RENDERING
───────────────────────────────────────── */
function renderQuestion(scenario, qIdx) {
  const q = scenario.questions[qIdx];
  if (!q) return;

  const letters = ['A', 'B', 'C', 'D', 'E'];

  setHTML('question-label', `<span class="question-label">Question ${qIdx + 1} of ${scenario.questions.length}</span>`);
  setText('question-text', q.text);

  const optionsList = document.getElementById('options-list');
  if (!optionsList) return;

  optionsList.innerHTML = q.options.map((opt, i) => `
    <button class="option-btn"
            data-qidx="${qIdx}"
            data-oidx="${i}"
            type="button"
            aria-label="Option ${letters[i]}: ${opt}">
      <span class="opt-letter">${letters[i]}</span>
      <span>${escapeHtml(opt)}</span>
    </button>`).join('');

  // Bind click handlers
  $$('.option-btn', optionsList).forEach(btn => {
    btn.addEventListener('click', handleOptionClick);
  });

  renderProgressSteps(scenario, qIdx);
}

function handleOptionClick(e) {
  const btn = e.currentTarget;
  const qIdx = parseInt(btn.dataset.qidx, 10);
  const oIdx = parseInt(btn.dataset.oidx, 10);
  const scenario = SCENARIOS[state.currentScenarioIdx];
  const q = scenario.questions[qIdx];

  // Prevent double-answering
  if (state.answeredQuestions.has(qIdx)) return;
  state.answeredQuestions.add(qIdx);

  const isCorrect = oIdx === q.correctIndex;

  // Visually mark all options
  const allBtns = $$('.option-btn');
  allBtns.forEach(b => {
    b.disabled = true;
    const bOIdx = parseInt(b.dataset.oidx, 10);
    if (bOIdx === q.correctIndex) {
      b.classList.add('correct');
    } else if (bOIdx === oIdx && !isCorrect) {
      b.classList.add('incorrect');
    }
  });

  // Award points
  const pointsEarned = isCorrect ? POINTS_CORRECT : POINTS_INCORRECT;
  if (!state.scenarioScores[scenario.id]) {
    state.scenarioScores[scenario.id] = { score: 0, max: scenario.questions.length * POINTS_CORRECT, completed: false };
  }
  state.scenarioScores[scenario.id].score += pointsEarned;
  if (isCorrect) state.totalScore += pointsEarned;

  updateScoreDisplay(
    state.scenarioScores[scenario.id].score,
    scenario.questions.length * POINTS_CORRECT
  );
  updateHeaderScore();
  saveState();

  // Show feedback overlay
  showFeedback(isCorrect, q, pointsEarned, qIdx, scenario);
}

/* ─────────────────────────────────────────
   FEEDBACK OVERLAY
───────────────────────────────────────── */
function showFeedback(isCorrect, question, points, qIdx, scenario) {
  const overlay = document.getElementById('feedback-overlay');
  const card = document.getElementById('feedback-card');
  if (!overlay || !card) return;

  card.className = `feedback-card ${isCorrect ? 'correct' : 'incorrect'}`;

  document.getElementById('feedback-icon').textContent   = isCorrect ? '✅' : '❌';
  document.getElementById('feedback-title').textContent  = isCorrect ? 'Correct!' : 'Incorrect';
  document.getElementById('feedback-points').textContent = isCorrect ? `+${points} pts` : `+0 pts`;
  document.getElementById('feedback-explanation').textContent = question.explanation;
  document.getElementById('feedback-concept-text').textContent = question.concept;

  const isLast = qIdx >= scenario.questions.length - 1;
  const nextBtn = document.getElementById('btn-feedback-next');
  if (nextBtn) {
    nextBtn.textContent = isLast ? '📊 View Results' : '▶ Next Question';
    nextBtn.onclick = () => {
      closeFeedback();
      if (isLast) {
        finishScenario(scenario);
      } else {
        state.currentQuestionIdx = qIdx + 1;
        renderQuestion(scenario, state.currentQuestionIdx);
      }
    };
  }

  overlay.classList.remove('hidden');
}

function closeFeedback() {
  const overlay = document.getElementById('feedback-overlay');
  if (overlay) overlay.classList.add('hidden');
}

/* ─────────────────────────────────────────
   PROGRESS STEPS (sidebar)
───────────────────────────────────────── */
function renderProgressSteps(scenario, activeQIdx) {
  const container = document.getElementById('progress-steps');
  if (!container) return;

  container.innerHTML = scenario.questions.map((q, i) => {
    let cls = '';
    if (state.answeredQuestions.has(i)) cls = 'done';
    else if (i === activeQIdx) cls = 'active';
    return `<div class="progress-step ${cls}">
      <span class="step-dot"></span>
      <span>Q${i + 1}: ${escapeHtml(q.text.substring(0, 45))}${q.text.length > 45 ? '…' : ''}</span>
    </div>`;
  }).join('');
}

/* ─────────────────────────────────────────
   FINISH SCENARIO
───────────────────────────────────────── */
function finishScenario(scenario) {
  if (state.scenarioScores[scenario.id]) {
    state.scenarioScores[scenario.id].completed = true;
  }
  saveState();

  const allDone = SCENARIOS.every(s => state.scenarioScores[s.id] && state.scenarioScores[s.id].completed);
  if (allDone) {
    showResults();
  } else {
    renderMap();
    show('screen-map');
  }
}

/* ─────────────────────────────────────────
   RESULTS SCREEN
───────────────────────────────────────── */
function showResults() {
  const maxPossible = SCENARIOS.reduce((sum, s) => sum + s.questions.length * POINTS_CORRECT, 0);
  const totalScore = Object.values(state.scenarioScores)
    .reduce((sum, s) => sum + (s.score || 0), 0);
  const pct = maxPossible > 0 ? totalScore / maxPossible : 0;

  setText('results-score-number', totalScore);
  setText('results-score-max', `/ ${maxPossible} pts`);

  // Grade
  let grade, gradeCls, gradeMsg;
  if (pct >= 0.9)      { grade = 'A – Expert Analyst';   gradeCls = 'grade-A'; gradeMsg = '🏆 Outstanding! You demonstrate mastery-level forensics knowledge.'; }
  else if (pct >= 0.75){ grade = 'B – Senior Analyst';   gradeCls = 'grade-B'; gradeMsg = '👍 Great work! Strong understanding across all forensics domains.'; }
  else if (pct >= 0.55){ grade = 'C – Junior Analyst';   gradeCls = 'grade-C'; gradeMsg = '📚 Good effort. Review the feedback explanations to deepen your knowledge.'; }
  else                  { grade = 'D – Cadet';            gradeCls = 'grade-D'; gradeMsg = '🔄 Keep practicing! Each scenario has detailed explanations to help you learn.'; }

  const gradeEl = document.getElementById('results-grade');
  if (gradeEl) { gradeEl.textContent = grade; gradeEl.className = `results-grade ${gradeCls}`; }
  setText('results-grade-msg', gradeMsg);

  // Breakdown
  const breakdown = document.getElementById('results-breakdown');
  if (breakdown) {
    breakdown.innerHTML = SCENARIOS.map((s, i) => {
      const sd = state.scenarioScores[s.id] || { score: 0, max: s.questions.length * POINTS_CORRECT };
      const p = sd.max > 0 ? sd.score / sd.max : 0;
      const cls = p >= 0.75 ? 'good' : p >= 0.5 ? 'ok' : 'poor';
      return `<div class="breakdown-item">
        <div class="breakdown-scenario">Case ${i + 1}</div>
        <div class="breakdown-name">${escapeHtml(s.title)}</div>
        <div class="breakdown-score ${cls}">${sd.score}/${sd.max} pts</div>
      </div>`;
    }).join('');
  }

  // Trophy emoji based on score
  setText('results-trophy', pct >= 0.9 ? '🏆' : pct >= 0.75 ? '🥈' : pct >= 0.55 ? '🥉' : '📋');

  bindResultsButtons();
  show('screen-results');
}

function bindResultsButtons() {
  const btnReplay = document.getElementById('btn-results-replay');
  const btnMap    = document.getElementById('btn-results-map');

  if (btnReplay) {
    btnReplay.onclick = () => {
      state.totalScore = 0;
      state.scenarioScores = {};
      state.answeredQuestions = new Set();
      saveState();
      renderMap();
      show('screen-map');
    };
  }

  if (btnMap) {
    btnMap.onclick = () => {
      renderMap();
      show('screen-map');
    };
  }
}

/* ─────────────────────────────────────────
   SCORE HELPERS
───────────────────────────────────────── */
function updateHeaderScore() {
  const el = document.getElementById('hdr-score');
  if (el) el.textContent = state.totalScore;
}

function updateScoreDisplay(score, max) {
  const el = document.getElementById('scenario-score-display');
  if (el) el.innerHTML = `<div class="score-number">${score}</div><div class="score-label">${score}/${max} pts</div>`;
}

/* ─────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Map → Title
  const btnMapBack = document.getElementById('btn-map-back');
  if (btnMapBack) btnMapBack.addEventListener('click', () => show('screen-title'));

  // Game → Map
  const btnGameBack = document.getElementById('btn-game-back');
  if (btnGameBack) {
    btnGameBack.addEventListener('click', () => {
      closeFeedback();
      renderMap();
      show('screen-map');
    });
  }

  // Results → Title
  const btnResultsHome = document.getElementById('btn-results-home');
  if (btnResultsHome) btnResultsHome.addEventListener('click', () => show('screen-title'));
});

/* ─────────────────────────────────────────
   SECURITY: HTML ESCAPING
───────────────────────────────────────── */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}
