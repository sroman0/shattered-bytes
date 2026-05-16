import { useState, useCallback, useRef, useEffect } from 'react';
import { CAMPAIGN, STORY } from '../data/campaign';
import { parseHexDump } from '../utils/hexUtils';
import { applyXor, parseXorKey } from '../utils/crypto';
import { carveBlob } from '../utils/buffer';

const GAME_PHASE = {
  MENU: 'menu',
  BRIEFING: 'briefing',
  PLAYING: 'playing',
  VICTORY: 'victory',
  CAMPAIGN_END: 'campaign_end',
};

// Load saved progress from localStorage
const loadSavedProgress = () => {
  try {
    const saved = localStorage.getItem('shattered_bytes_save');
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return null;
};

export default function useGameState() {
  const savedProgress = loadSavedProgress();

  // --- Fase e progressione ---
  const [phase, setPhase] = useState(GAME_PHASE.MENU);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [levelData, setLevelData] = useState(null);
  const [hexBytes, setHexBytes] = useState([]);
  const [completedLevels, setCompletedLevels] = useState(savedProgress?.completedLevels || []);

  // --- Selezione hex ---
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // --- Workbench ---
  const [stashedChunks, setStashedChunks] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);

  // --- Carving result ---
  const [carvedUrl, setCarvedUrl] = useState(null);
  const [carvedText, setCarvedText] = useState(null);
  const [pendingCaseResult, setPendingCaseResult] = useState(null);
  const [caseResults, setCaseResults] = useState(savedProgress?.caseResults || []);
  const [latestCaseResult, setLatestCaseResult] = useState(null);

  // --- MBR unlock ---
  const [unlockedOffset, setUnlockedOffset] = useState(null);

  // --- Go-to-offset trigger for HexEditor navigation (object so duplicates re-trigger) ---
  const [goToOffsetTrigger, setGoToOffsetTrigger] = useState(null);
  const triggerGoTo = useCallback((offset) => setGoToOffsetTrigger({ offset, ts: Date.now() }), []);

  // --- Terminal logs ---
  const [logs, setLogs] = useState([
    { type: 'system', text: 'SHATTERED BYTES Forensic Framework v2.0' },
    { type: 'system', text: 'Kernel initialized. Awaiting operator input.' },
    { type: 'info', text: 'Type "help" for available commands.' },
  ]);

  // --- Investigation Timeline ---
  const [timelineEvents, setTimelineEvents] = useState([]);
  const timelineCountRef = useRef(0);

  const addTimelineEvent = useCallback((type, text) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    timelineCountRef.current += 1;
    setTimelineEvents(prev => [...prev, {
      id: timelineCountRef.current,
      type,
      text,
      time,
    }]);
  }, []);

  // --- Score & Timer ---
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(savedProgress?.totalScore || 0);
  const [badSelections, setBadSelections] = useState(0);
  const [carveAttempts, setCarveAttempts] = useState(0);
  const [reportAttempts, setReportAttempts] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHintIdx, setCurrentHintIdx] = useState(0);

  // --- Obiettivi ---
  const [objectives, setObjectives] = useState([]);

  // Timer interval ref
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === GAME_PHASE.PLAYING && levelStartTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - levelStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, levelStartTime]);

  const currentLevel = CAMPAIGN[currentLevelIdx];

  // --- Logging ---
  const pushLog = useCallback((text, type = 'info') => {
    setLogs(prev => [...prev, { type, text }]);
  }, []);

  // --- Completa un obiettivo ---
  const completeObjective = useCallback((objId) => {
    setObjectives(prev =>
      prev.map(o => o.id === objId ? { ...o, completed: true } : o)
    );
  }, []);

  const getRangeRole = useCallback((start, end) => {
    const solutions = levelData?.solution_offsets || [];
    const exactIdx = solutions.findIndex(r => r.start === start && r.end === end);
    if (exactIdx >= 0) {
      return {
        verdict: levelData?.metadata?.partial_recovery ? 'partial' : 'valid',
        solutionIdx: exactIdx,
        note: levelData?.metadata?.partial_recovery
          ? 'Recoverable fragment. The original artefact has overwritten bytes.'
          : 'Exact evidence range. Offset and length match the forensic answer key.',
      };
    }

    const falsePositive = (levelData?.metadata?.false_positives || [])
      .find(r => start <= r.end && end >= r.start);
    if (falsePositive) {
      return {
        verdict: 'decoy',
        solutionIdx: -1,
        note: falsePositive.reason || 'Known false positive. Signature alone is not sufficient.',
      };
    }

    const overlapIdx = solutions.findIndex(r => start <= r.end && end >= r.start);
    if (overlapIdx >= 0) {
      return {
        verdict: 'overlap',
        solutionIdx: overlapIdx,
        note: 'Selection overlaps real evidence but includes missing or extra bytes.',
      };
    }

    return {
      verdict: 'unsupported',
      solutionIdx: -1,
      note: 'Unsupported range. No evidentiary relationship established.',
    };
  }, [levelData]);

  // --- Load Level ---
  const loadLevel = useCallback(async (idx) => {
    try {
      const meta = CAMPAIGN[idx];
      pushLog(`Loading ${meta.title}...`, 'system');

      const response = await fetch(`/levels/${meta.id}.json`);
      if (!response.ok) throw new Error('Level data not found on disk');
      const data = await response.json();

      // Reset tutto
      setLevelData(data);
      setCurrentLevelIdx(idx);
      setHexBytes(parseHexDump(data.hex_dump));
      setSelectionStart(null);
      setSelectionEnd(null);
      setStashedChunks([]);
      setJournalEntries([]);
      setCarvedUrl(null);
      setCarvedText(null);
      setPendingCaseResult(null);
      setLatestCaseResult(null);
      setUnlockedOffset(null);
      setHintsUsed(0);
      setCurrentHintIdx(0);
      setBadSelections(0);
      setCarveAttempts(0);
      setReportAttempts(0);
      setObjectives(meta.objectives.map(o => ({ ...o, completed: false })));
      setTimelineEvents([]);
      timelineCountRef.current = 0;

      // Briefing
      setPhase(GAME_PHASE.BRIEFING);
    } catch (err) {
      pushLog(err.message, 'error');
    }
  }, [pushLog]);

  // --- Start playing (dopo briefing) ---
  const startPlaying = useCallback(() => {
    setPhase(GAME_PHASE.PLAYING);
    setLevelStartTime(Date.now());
    setElapsedTime(0);
    setLogs([
      { type: 'system', text: STORY.operation },
      { type: 'info', text: `Handler: Agent Root | Adversary: ${STORY.antagonist}` },
      { type: 'system', text: `MISSION: ${currentLevel.title}` },
      { type: 'info', text: currentLevel.subtitle },
      { type: 'system', text: 'Datastream loaded. Hex viewer online.' },
      { type: 'info', text: `Hex dump size: ${hexBytes.length} bytes` },
    ]);
    if (currentLevel.requires_mbr) {
      pushLog('WARNING: Sectors beyond MBR are encrypted. Parse partition table and use "go <offset>" to unlock.', 'error');
    }
    if (currentLevel.requires_xor) {
      const hint = levelData?.metadata?.known_plaintext_hint;
      if (hint) {
        pushLog(`INTEL: Single-byte XOR obfuscation suspected. Known plaintext starts with "${hint}".`, 'warning');
      } else {
        pushLog('INTEL: Single-byte XOR obfuscation suspected. Derive the key from known plaintext.', 'warning');
      }
    }
  }, [currentLevel, hexBytes.length, levelData, pushLog]);

  // --- Selezione byte ---
  const beginSelection = useCallback((absIdx) => {
    setIsSelecting(true);
    setSelectionStart(absIdx);
    setSelectionEnd(absIdx);
  }, []);

  const extendSelection = useCallback((absIdx) => {
    setSelectionEnd(absIdx);
  }, []);

  const endSelection = useCallback(() => {
    setIsSelecting(false);
  }, []);

  // --- Stash ---
  const stashSelection = useCallback(() => {
    if (selectionStart === null || selectionEnd === null) return;
    const sStart = Math.min(selectionStart, selectionEnd);
    const sEnd = Math.max(selectionStart, selectionEnd);

    const chunkHex = hexBytes.slice(sStart, sEnd + 1).join('');
    const newChunk = {
      id: Date.now(),
      hex: chunkHex,
      sourceHex: chunkHex,
      start: sStart,
      end: sEnd,
      size: sEnd - sStart + 1,
      opApplied: null,
    };
    const assessment = getRangeRole(sStart, sEnd);
    newChunk.verdict = assessment.verdict;
    newChunk.solutionIdx = assessment.solutionIdx;

    setStashedChunks(prev => [...prev, newChunk]);
    setJournalEntries(prev => [...prev, {
      id: newChunk.id,
      start: sStart,
      end: sEnd,
      size: newChunk.size,
      verdict: assessment.verdict,
      note: assessment.note,
    }]);

    const logType = ['valid', 'partial'].includes(assessment.verdict) ? 'success'
      : assessment.verdict === 'overlap' ? 'warning'
        : 'error';
    pushLog(`Fragment stashed: ${newChunk.size} bytes [0x${sStart.toString(16).toUpperCase()} - 0x${sEnd.toString(16).toUpperCase()}]`, logType);
    pushLog(`Journal assessment: ${assessment.note}`, logType);
    addTimelineEvent('stash', `Stashed ${newChunk.size}B [0x${sStart.toString(16).toUpperCase()}]`);

    if (['decoy', 'unsupported', 'overlap'].includes(assessment.verdict)) {
      setBadSelections(prev => prev + 1);
    }

    if (assessment.verdict === 'valid') {
      const diff = currentLevel.difficulty;
      if (diff === 'triage') {
        completeObjective('find_header');
        completeObjective('select_range');
      }
      if (diff === 'fragmented') {
        completeObjective(assessment.solutionIdx === 0 ? 'find_chunk1' : 'find_chunk2');
      }
      if (diff === 'multi_sig') {
        completeObjective('identify_target');
        completeObjective('avoid_pdf');
        completeObjective('select_range');
      }
      if (diff === 'ransomware') {
        const chunkNames = ['find_chunk1', 'find_chunk2', 'find_chunk3'];
        if (assessment.solutionIdx >= 0 && assessment.solutionIdx < chunkNames.length) {
          completeObjective(chunkNames[assessment.solutionIdx]);
        }
      }
    }

    if (assessment.verdict === 'partial') {
      completeObjective('find_partial');
    }

    setSelectionStart(null);
    setSelectionEnd(null);
  }, [selectionStart, selectionEnd, hexBytes, pushLog, completeObjective, getRangeRole, currentLevel]);

  const removeStash = useCallback((id) => {
    setStashedChunks(prev => prev.filter(c => c.id !== id));
  }, []);

  const moveStash = useCallback((fromIdx, toIdx) => {
    setStashedChunks(prev => {
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
    completeObjective('order_chunks');
  }, [completeObjective]);

  // --- XOR Operation ---
  const applyXorOp = useCallback((keyInput) => {
    if (stashedChunks.length === 0) {
      pushLog('Workbench is empty. Stash fragments first.', 'error');
      return;
    }
    const key = parseXorKey(keyInput);
    if (key === null) {
      pushLog(`Invalid XOR key: "${keyInput}". Use hex (0x1A) or decimal (26).`, 'error');
      return;
    }

    // Apply XOR to all chunks in workbench
    setStashedChunks(prev => prev.map(chunk => {
      const sourceHex = chunk.sourceHex || chunk.hex;
      const decrypted = applyXor(sourceHex, key);
      return {
        ...chunk,
        sourceHex,
        hex: decrypted,
        opApplied: `XOR 0x${key.toString(16).toUpperCase().padStart(2, '0')}`,
      };
    }));
    pushLog(`XOR transform applied to ${stashedChunks.length} chunk(s): key=0x${key.toString(16).toUpperCase().padStart(2, '0')}`, 'info');
    addTimelineEvent('xor', `XOR decrypt key=0x${key.toString(16).toUpperCase().padStart(2, '0')}`);
  }, [stashedChunks, pushLog, addTimelineEvent]);

  const rangesMatchSolutions = useCallback(() => {
    const solutions = levelData?.solution_offsets || [];
    if (stashedChunks.length !== solutions.length) return false;
    return stashedChunks.every((chunk, idx) =>
      chunk.start === solutions[idx].start && chunk.end === solutions[idx].end
    );
  }, [levelData, stashedChunks]);

  const closeCase = useCallback((reportKey) => {
    if (!pendingCaseResult) {
      pushLog('No carved artefact is awaiting a forensic conclusion.', 'error');
      return;
    }

    const normalized = reportKey.trim().toLowerCase();
    if (normalized !== pendingCaseResult.expectedReport) {
      setReportAttempts(prev => prev + 1);
      setBadSelections(prev => prev + 1);
      pushLog(`Report rejected: "${normalized}" overstates or misclassifies the evidence.`, 'error');
      return;
    }

    completeObjective(`report_${normalized}`);
    if (normalized === 'partial') completeObjective('declare_limit');

    if (timerRef.current) clearInterval(timerRef.current);
    const timeElapsed = Math.floor((Date.now() - levelStartTime) / 1000);
    const meta = CAMPAIGN[currentLevelIdx];
    let levelScore = meta.maxScore;

    levelScore -= hintsUsed * 15;
    levelScore -= badSelections * 25;
    levelScore -= Math.max(0, carveAttempts - 1) * 30;
    levelScore -= reportAttempts * 40;

    if (timeElapsed <= meta.timeBonusThreshold) {
      const timeBonus = Math.round((1 - timeElapsed / meta.timeBonusThreshold) * 35);
      levelScore += timeBonus;
      pushLog(`Time bonus: +${timeBonus} points`, 'success');
    }

    levelScore = Math.max(0, levelScore);
    const result = {
      levelId: meta.id,
      title: meta.title,
      score: levelScore,
      maxScore: meta.maxScore,
      report: normalized,
      status: pendingCaseResult.status,
      obfuscationHandled: stashedChunks.some(chunk => chunk.opApplied?.startsWith('XOR')),
      hintsUsed,
      badSelections,
      carveAttempts,
      elapsedTime: timeElapsed,
      journalCount: journalEntries.length,
    };

    setScore(levelScore);
    const newTotal = totalScore + levelScore;
    setTotalScore(newTotal);
    const newCompleted = completedLevels.includes(currentLevelIdx) ? completedLevels : [...completedLevels, currentLevelIdx];
    setCompletedLevels(newCompleted);
    const newResults = [...caseResults, result];
    setCaseResults(newResults);
    setLatestCaseResult(result);
    setPendingCaseResult(null);
    addTimelineEvent('report', `Case closed: ${normalized} (${levelScore}/${meta.maxScore})`);

    // Save progress to localStorage
    try {
      localStorage.setItem('shattered_bytes_save', JSON.stringify({
        completedLevels: newCompleted,
        totalScore: newTotal,
        caseResults: newResults,
        savedAt: new Date().toISOString(),
      }));
    } catch (e) { /* ignore storage errors */ }

    pushLog(`CASE CLOSED. Forensic conclusion accepted: ${normalized}. Score: ${levelScore}/${meta.maxScore}`, 'success');
    setPhase(GAME_PHASE.VICTORY);
  }, [
    pendingCaseResult,
    pushLog,
    completeObjective,
    levelStartTime,
    currentLevelIdx,
    hintsUsed,
    badSelections,
    carveAttempts,
    reportAttempts,
    journalEntries.length,
    stashedChunks,
  ]);

  // --- Carve ---
  const carveData = useCallback(() => {
    if (stashedChunks.length === 0) {
      pushLog('Workbench is empty. Stash fragments first.', 'error');
      return;
    }
    setCarveAttempts(prev => prev + 1);

    const exactRecovery = rangesMatchSolutions();
    const partialRecovery = levelData?.metadata?.partial_recovery && exactRecovery;

    if (!exactRecovery) {
      setBadSelections(prev => prev + 1);
      pushLog('Carve rejected: fragment set does not match the evidence map. Check range boundaries and order.', 'error');
      return;
    }

    const combinedHex = stashedChunks.map(c => c.hex).join('');
    const ext = levelData?.target_extension || 'bin';
    const result = carveBlob(combinedHex, ext);
    const expectedTextPrefix = levelData?.metadata?.expected_text_prefix
      || levelData?.metadata?.known_plaintext_hint;

    if (ext === 'txt' && expectedTextPrefix && !result.text?.startsWith(expectedTextPrefix)) {
      setBadSelections(prev => prev + 1);
      setCarvedText(null);
      setCarvedUrl(null);
      setPendingCaseResult(null);
      pushLog(`Carve rejected: decoded text does not match expected plaintext prefix "${expectedTextPrefix}". Check the XOR key and retry.`, 'error');
      return;
    }

    if (currentLevel.requires_xor) {
      completeObjective('find_key');
      completeObjective('decrypt');
    }

    if (result.text) {
      setCarvedText(result.text);
      setCarvedUrl(null);
      pushLog(`Text payload extracted: "${result.text.substring(0, 50)}${result.text.length > 50 ? '...' : ''}"`, 'success');
      addTimelineEvent('carve', `Text carved: ${result.text.length} chars`);
    } else if (result.url) {
      setCarvedUrl(result.url);
      setCarvedText(null);
      pushLog('Binary payload carved. Object rendered in Asset Viewer.', 'success');
      addTimelineEvent('carve', 'Binary payload carved');
    }

    completeObjective('carve_file');
    if (currentLevel.difficulty === 'fragmented') {
      completeObjective('order_chunks');
    }
    if (partialRecovery) {
      completeObjective('declare_limit');
    }

    const expectedReport = currentLevel.acceptedReport || (partialRecovery ? 'partial' : 'recovered');
    setPendingCaseResult({
      status: partialRecovery ? 'partial' : 'recovered',
      expectedReport,
    });
    pushLog(`Payload validated. Submit final conclusion with: report ${expectedReport}`, 'warning');
  }, [stashedChunks, levelData, pushLog, completeObjective, rangesMatchSolutions, currentLevel]);

  // --- Avanza al livello successivo ---
  const nextLevel = useCallback(() => {
    if (currentLevelIdx + 1 < CAMPAIGN.length) {
      loadLevel(currentLevelIdx + 1);
    } else {
      setPhase(GAME_PHASE.CAMPAIGN_END);
      pushLog('ALL CASES CLOSED. Campaign complete.', 'success');
    }
  }, [currentLevelIdx, loadLevel, pushLog]);

  // --- Hint ---
  const useHint = useCallback(() => {
    const meta = CAMPAIGN[currentLevelIdx];
    if (currentHintIdx >= meta.hints.length) {
      pushLog('No more hints available for this case.', 'error');
      return;
    }
    pushLog(`HINT: ${meta.hints[currentHintIdx]}`, 'warning');
    setHintsUsed(prev => prev + 1);
    addTimelineEvent('hint', `Hint used (${currentHintIdx + 1}/${meta.hints.length})`);
    setCurrentHintIdx(prev => prev + 1);
  }, [currentLevelIdx, currentHintIdx, pushLog]);

  // --- Terminal command handler ---
  const executeCommand = useCallback((cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    pushLog(`> ${trimmed}`, 'command');
    const args = trimmed.toLowerCase().split(/\s+/);

    switch (args[0]) {
      case 'help':
        pushLog('--- AVAILABLE COMMANDS ---', 'system');
        pushLog('  help              — Show this message', 'info');
        pushLog('  go <offset>       — Jump to byte offset / unlock MBR sector', 'info');
        pushLog('  select <a> <b>    — Select byte range by offsets, then stash', 'info');
        pushLog('  search <hex>      — Search for hex pattern (e.g. search 89504E47)', 'info');
        pushLog('  entropy [size]    — Scan byte blocks for entropy anomalies', 'info');
        pushLog('  info              — Show current level metadata', 'info');
        pushLog('  hint              — Request an investigation hint (-15 pts)', 'info');
        pushLog('  xor <key>         — Apply XOR to workbench chunk (e.g. xor 0x1A)', 'info');
        pushLog('  xorcalc <a> <b>   — XOR two bytes to derive a key (e.g. xorcalc 0x78 0x52)', 'info');
        pushLog('  report <finding>  — Submit final finding: recovered | partial | inconclusive', 'info');
        pushLog('  clear             — Clear terminal output', 'info');
        pushLog('  status            — Show objectives and score', 'info');
        break;

      case 'go':
        if (args.length < 2) {
          pushLog('Usage: go <offset> (decimal or 0x hex)', 'error');
          break;
        }
        {
          const offsetStr = args[1];
          let offset;
          if (offsetStr.startsWith('0x')) {
            offset = parseInt(offsetStr, 16);
          } else {
            offset = parseInt(offsetStr, 10);
          }

          if (isNaN(offset)) {
            pushLog(`Invalid offset: "${args[1]}"`, 'error');
            break;
          }

          if (levelData?.difficulty === 'mbr') {
            if (offset === levelData.metadata.partition_table_offset) {
              triggerGoTo(offset);
              pushLog(`Navigating to MBR partition table at offset ${offset} (0x${offset.toString(16).toUpperCase()}).`, 'success');
              pushLog('Read bytes 8-11 of the first 16-byte entry, convert the Little-Endian LBA, then multiply by the sector size to unlock.', 'info');
              addTimelineEvent('navigate', `MBR table at 0x${offset.toString(16).toUpperCase()}`);
              completeObjective('read_mbr');
              break;
            }

            if (offset === levelData.metadata.target_offset_encoded) {
              setUnlockedOffset(offset);
              triggerGoTo(offset);
              pushLog(`SECTOR UNLOCKED at offset ${offset} (0x${offset.toString(16).toUpperCase()})`, 'success');
              addTimelineEvent('navigate', `Sector unlocked at 0x${offset.toString(16).toUpperCase()}`);
              pushLog('Encrypted sectors are now readable. Proceed with carving.', 'success');
              completeObjective('read_mbr');
              completeObjective('find_lba');
              completeObjective('calculate_offset');
              completeObjective('unlock_sector');
            } else {
              pushLog(`ACCESS DENIED: Offset ${offset} is incorrect. Review your Little-Endian calculation.`, 'error');
            }
          } else {
            triggerGoTo(offset);
            pushLog(`Navigating to offset ${offset} (0x${offset.toString(16).toUpperCase()})`, 'info');
            addTimelineEvent('navigate', `Go to 0x${offset.toString(16).toUpperCase()}`);
          }
        }
        break;

      case 'select':
        if (args.length < 2) {
          pushLog('Usage: select <start> <end> (decimal or 0x hex)', 'error');
          break;
        }
        {
          const parseOffset = (value) => {
            const cleaned = value.trim().replace(/,$/, '');
            const parsed = cleaned.startsWith('0x') ? parseInt(cleaned, 16) : parseInt(cleaned, 10);
            if (Number.isNaN(parsed) || parsed < 0 || parsed >= hexBytes.length) return null;
            return parsed;
          };

          const rangeTokens = args
            .slice(1)
            .join(' ')
            .replace(/\s*[-–—]\s*/, ' ')
            .split(/\s+/)
            .filter(Boolean);
          const startToken = rangeTokens[0];
          const endToken = rangeTokens[1];

          const start = parseOffset(startToken || '');
          const end = parseOffset(endToken || '');
          if (start === null || end === null) {
            pushLog('select expects two offsets inside the current dump.', 'error');
            break;
          }

          const s = Math.min(start, end);
          const e = Math.max(start, end);
          if (levelData?.difficulty === 'mbr' && unlockedOffset === null && e >= 512) {
            pushLog('Selection blocked: target sectors are still locked. Use go <calculated_offset> first.', 'error');
            break;
          }

          setSelectionStart(s);
          setSelectionEnd(e);
          setIsSelecting(false);
          triggerGoTo(s);
          pushLog(`Selected range 0x${s.toString(16).toUpperCase()} - 0x${e.toString(16).toUpperCase()} (${e - s + 1} bytes). Click + Stash Selection.`, 'success');
          addTimelineEvent('select', `Selected 0x${s.toString(16).toUpperCase()}-0x${e.toString(16).toUpperCase()}`);
        }
        break;

      case 'entropy':
        {
          const requestedSize = args[1] ? parseInt(args[1], 10) : (levelData?.metadata?.entropy_block_size || 64);
          const blockSize = Number.isNaN(requestedSize)
            ? 64
            : Math.max(16, Math.min(256, requestedSize));
          const bytes = hexBytes.map(b => parseInt(b, 16));
          const blocks = [];

          for (let offset = 0; offset < bytes.length; offset += blockSize) {
            const slice = bytes.slice(offset, offset + blockSize);
            if (slice.length < blockSize) continue;

            const counts = new Map();
            slice.forEach(byte => counts.set(byte, (counts.get(byte) || 0) + 1));

            let entropy = 0;
            counts.forEach(count => {
              const p = count / slice.length;
              entropy -= p * Math.log2(p);
            });

            blocks.push({
              offset,
              end: offset + slice.length - 1,
              len: slice.length,
              unique: counts.size,
              entropy,
            });
          }

          if (blocks.length === 0) {
            pushLog('Entropy scan unavailable: current dump is empty.', 'error');
            break;
          }

          const avgEntropy = blocks.reduce((sum, b) => sum + b.entropy, 0) / blocks.length;
          const candidates = blocks
            .map(block => ({ ...block, delta: Math.abs(block.entropy - avgEntropy) }))
            .sort((a, b) => b.delta - a.delta)
            .slice(0, 6);

          pushLog(`Entropy scan: ${blockSize}B blocks | average H=${avgEntropy.toFixed(2)} bits/byte`, 'system');
          pushLog('Largest deviations from baseline. Low H / fewer unique bytes can indicate structured encoded payloads.', 'info');
          candidates.forEach((block, idx) => {
            const type = idx < 2 ? 'success' : 'info';
            pushLog(
              `  0x${block.offset.toString(16).toUpperCase()}-0x${block.end.toString(16).toUpperCase()} | H=${block.entropy.toFixed(2)} | unique=${block.unique}/${block.len} | delta=${block.delta.toFixed(2)}`,
              type
            );
          });

          if (levelData?.metadata?.payload_markers?.length) {
            const markers = levelData.metadata.payload_markers
              .map(m => `${m.label}=0x${m.offset.toString(16).toUpperCase()}`)
              .join(' | ');
            pushLog(`Marker intel available: ${markers}. Cross-check with search 4E4D / search 4E58.`, 'warning');
          }
          addTimelineEvent('entropy', `Entropy scan ${blockSize}B`);
        }
        break;

      case 'search':
        if (args.length < 2) {
          pushLog('Usage: search <hex_pattern>', 'error');
          break;
        }
        {
          const pattern = args.slice(1).join('').toUpperCase().replace(/\s/g, '');
          const joined = hexBytes.join('').toUpperCase();
          const matches = [];
          let from = 0;
          while (matches.length < 8) {
            const idx = joined.indexOf(pattern, from);
            if (idx < 0) break;
            matches.push(idx / 2);
            from = idx + Math.max(2, pattern.length);
          }
          if (matches.length > 0) {
            pushLog(`Pattern found ${matches.length}${matches.length === 8 ? '+' : ''} time(s):`, 'success');
            matches.forEach(byteIdx => {
              pushLog(`  offset ${byteIdx} (0x${byteIdx.toString(16).toUpperCase()})`, 'success');
            });
            addTimelineEvent('search', `Found ${pattern} at ${matches.length} offset(s)`);
          } else {
            pushLog(`Pattern "${pattern}" not found in current dump.`, 'error');
            addTimelineEvent('search', `No match: ${pattern}`);
          }
        }
        break;

      case 'info':
        if (levelData) {
          pushLog(`Level: ${levelData.difficulty} | Extension: .${levelData.target_extension} | Target size: ${levelData.target_size} bytes`, 'info');
          if (levelData.metadata?.mbr_present) pushLog('MBR detected at offset 0. Partition table at 0x1BE.', 'info');
          if (levelData.metadata?.xor_encoded) {
            pushLog('XOR obfuscation detected. Key is not provided; use known plaintext and xorcalc.', 'warning');
          }
          if (levelData.metadata?.payload_markers?.length) {
            pushLog('Loader markers detected in case notes. Try search 4E4D (NM) and search 4E58 (NX) to enumerate XOR candidates.', 'warning');
          }
          if (levelData.metadata?.fragment_markers?.length) {
            pushLog('Fragment run descriptors detected. Try search 46523031 (FR01) and search 46523032 (FR02); each descriptor is followed by a two-byte length.', 'warning');
          }
          if (levelData.metadata?.chunk_markers?.length) {
            pushLog('Exfiltration records detected. Try search 45583031, 45583032, 45583033; each record is followed by one length byte.', 'warning');
          }
          if (levelData.metadata?.partial_recovery) {
            pushLog(`Partial recovery: ${levelData.metadata.recoverable_size}/${levelData.metadata.original_size} bytes survived.`, 'warning');
          }
        }
        break;

      case 'hint':
        useHint();
        break;

      case 'xor':
        if (args.length < 2) {
          pushLog('Usage: xor <key> (e.g. xor 0x1A or xor 26)', 'error');
          break;
        }
        applyXorOp(args[1]);
        break;

      case 'xorcalc':
        if (args.length < 3) {
          pushLog('Usage: xorcalc <byte_a> <byte_b> (e.g. xorcalc 0x78 0x52)', 'error');
          break;
        }
        {
          const parseByte = (value) => {
            const parsed = value.startsWith('0x') ? parseInt(value, 16) : parseInt(value, 10);
            if (Number.isNaN(parsed) || parsed < 0 || parsed > 255) return null;
            return parsed;
          };
          const a = parseByte(args[1]);
          const b = parseByte(args[2]);
          if (a === null || b === null) {
            pushLog('xorcalc expects byte values between 0 and 255.', 'error');
            break;
          }
          const out = a ^ b;
          pushLog(`0x${a.toString(16).toUpperCase().padStart(2, '0')} XOR 0x${b.toString(16).toUpperCase().padStart(2, '0')} = 0x${out.toString(16).toUpperCase().padStart(2, '0')} (${out})`, 'success');
          if (currentLevel.requires_xor && out === levelData?.metadata?.xor_key) {
            completeObjective('find_key');
          }
        }
        break;

      case 'report':
        if (args.length < 2) {
          pushLog('Usage: report <recovered|partial|inconclusive>', 'error');
          break;
        }
        closeCase(args[1]);
        break;

      case 'clear':
        setLogs([]);
        break;

      case 'status':
        pushLog(`--- MISSION STATUS ---`, 'system');
        objectives.forEach(o => {
          pushLog(`  ${o.completed ? '[x]' : '[ ]'} ${o.text}`, o.completed ? 'success' : 'info');
        });
        pushLog(`Hints used: ${hintsUsed} | Bad leads: ${badSelections} | Carves: ${carveAttempts} | Time: ${elapsedTime}s`, 'info');
        if (pendingCaseResult) pushLog(`Awaiting report: report ${pendingCaseResult.expectedReport}`, 'warning');
        break;

      default:
        pushLog(`Unknown command: "${args[0]}". Type "help" for available commands.`, 'error');
    }
  }, [pushLog, levelData, hexBytes, objectives, hintsUsed, badSelections, carveAttempts, elapsedTime, pendingCaseResult, closeCase, currentLevel, completeObjective, useHint, applyXorOp, triggerGoTo, unlockedOffset, addTimelineEvent]);

  // --- Reset game ---
  const resetGame = useCallback(() => {
    setPhase(GAME_PHASE.MENU);
    setCurrentLevelIdx(0);
    setLevelData(null);
    setHexBytes([]);
    setCompletedLevels([]);
    setCaseResults([]);
    setLatestCaseResult(null);
    setPendingCaseResult(null);
    setTotalScore(0);
    setScore(0);
    setBadSelections(0);
    setCarveAttempts(0);
    setReportAttempts(0);
    setJournalEntries([]);
    setTimelineEvents([]);
    timelineCountRef.current = 0;
    try { localStorage.removeItem('shattered_bytes_save'); } catch (e) { /* ignore */ }
    setLogs([
      { type: 'system', text: 'SHATTERED BYTES Forensic Framework v2.0' },
      { type: 'system', text: 'System reset. Awaiting operator input.' },
    ]);
  }, []);

  // --- Return to menu (preserve progress) ---
  const returnToMenu = useCallback(() => {
    setPhase(GAME_PHASE.MENU);
    // Only clear current-level state, keep progress
    setLevelData(null);
    setHexBytes([]);
    setLatestCaseResult(null);
    setPendingCaseResult(null);
    setScore(0);
    setBadSelections(0);
    setCarveAttempts(0);
    setReportAttempts(0);
    setSelectionStart(null);
    setSelectionEnd(null);
    setIsSelecting(false);
    setStashedChunks([]);
    setCarvedUrl(null);
    setCarvedText(null);
    setUnlockedOffset(null);
    setJournalEntries([]);
    setObjectives([]);
    setElapsedTime(0);
    setHintsUsed(0);
    setLogs([
      { type: 'system', text: 'SHATTERED BYTES Forensic Framework v2.0' },
      { type: 'info', text: `Progress saved. ${completedLevels.length} cases completed. Score: ${totalScore}.` },
      { type: 'system', text: 'Returned to main menu.' },
    ]);
  }, [completedLevels.length, totalScore]);

  return {
    // State
    phase,
    currentLevelIdx,
    currentLevel,
    levelData,
    hexBytes,
    completedLevels,
    selectionStart,
    selectionEnd,
    isSelecting,
    stashedChunks,
    journalEntries,
    carvedUrl,
    carvedText,
    pendingCaseResult,
    caseResults,
    latestCaseResult,
    unlockedOffset,
    goToOffsetTrigger,
    logs,
    score,
    totalScore,
    elapsedTime,
    hintsUsed,
    badSelections,
    carveAttempts,
    objectives,
    timelineEvents,

    // Actions
    loadLevel,
    startPlaying,
    beginSelection,
    extendSelection,
    endSelection,
    stashSelection,
    removeStash,
    moveStash,
    applyXorOp,
    carveData,
    nextLevel,
    useHint,
    executeCommand,
    pushLog,
    resetGame,
    returnToMenu,

    // Constants
    GAME_PHASE,
    CAMPAIGN,
  };
}
