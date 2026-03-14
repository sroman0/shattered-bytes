import { useState, useCallback, useRef, useEffect } from 'react';
import { CAMPAIGN } from '../data/campaign';
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

export default function useGameState() {
  // --- Fase e progressione ---
  const [phase, setPhase] = useState(GAME_PHASE.MENU);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [levelData, setLevelData] = useState(null);
  const [hexBytes, setHexBytes] = useState([]);
  const [completedLevels, setCompletedLevels] = useState([]);

  // --- Selezione hex ---
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // --- Workbench ---
  const [stashedChunks, setStashedChunks] = useState([]);

  // --- Carving result ---
  const [carvedUrl, setCarvedUrl] = useState(null);
  const [carvedText, setCarvedText] = useState(null);

  // --- MBR unlock ---
  const [unlockedOffset, setUnlockedOffset] = useState(null);

  // --- Terminal logs ---
  const [logs, setLogs] = useState([
    { type: 'system', text: 'SHATTERED BYTES Forensic Framework v2.0' },
    { type: 'system', text: 'Kernel initialized. Awaiting operator input.' },
    { type: 'info', text: 'Type "help" for available commands.' },
  ]);

  // --- Score & Timer ---
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
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
      setCarvedUrl(null);
      setCarvedText(null);
      setUnlockedOffset(null);
      setHintsUsed(0);
      setCurrentHintIdx(0);
      setObjectives(meta.objectives.map(o => ({ ...o, completed: false })));

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
      { type: 'system', text: `MISSION: ${currentLevel.title}` },
      { type: 'info', text: currentLevel.subtitle },
      { type: 'system', text: 'Datastream loaded. Hex viewer online.' },
      { type: 'info', text: `Hex dump size: ${hexBytes.length} bytes` },
    ]);
    if (currentLevel.requires_mbr) {
      pushLog('WARNING: Sectors beyond MBR are encrypted. Parse partition table and use "go <offset>" to unlock.', 'error');
    }
    if (currentLevel.requires_xor) {
      const key = levelData?.metadata?.xor_key;
      if (key !== undefined) {
        pushLog(`INTEL: Malware analysis reports XOR key = 0x${key.toString(16).toUpperCase().padStart(2, '0')} (decimal: ${key})`, 'warning');
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
    if (isSelecting) setSelectionEnd(absIdx);
  }, [isSelecting]);

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
      start: sStart,
      end: sEnd,
      size: sEnd - sStart + 1,
      opApplied: null,
    };

    setStashedChunks(prev => [...prev, newChunk]);
    pushLog(`Fragment stashed: ${newChunk.size} bytes [0x${sStart.toString(16).toUpperCase()} — 0x${sEnd.toString(16).toUpperCase()}]`, 'success');

    // Auto-check objectives
    const header = chunkHex.substring(0, 8).toUpperCase();
    if (header === '89504E47') {
      completeObjective('find_header');
      completeObjective('find_chunk1');
    }
    const footer = chunkHex.slice(-16).toUpperCase();
    if (footer.includes('49454E44AE426082')) {
      completeObjective('find_chunk2');
    }
    completeObjective('select_range');
    completeObjective('stash_chunk');
    completeObjective('stash_payload');
    completeObjective('find_payload');

    setSelectionStart(null);
    setSelectionEnd(null);
  }, [selectionStart, selectionEnd, hexBytes, pushLog, completeObjective]);

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
    if (stashedChunks.length !== 1) {
      pushLog('XOR requires exactly one chunk in the Workbench.', 'error');
      return;
    }
    const key = parseXorKey(keyInput);
    if (key === null) {
      pushLog(`Invalid XOR key: "${keyInput}". Use hex (0x1A) or decimal (26).`, 'error');
      return;
    }

    const chunk = stashedChunks[0];
    const decrypted = applyXor(chunk.hex, key);
    setStashedChunks([{ ...chunk, hex: decrypted, opApplied: `XOR 0x${key.toString(16).toUpperCase().padStart(2, '0')}` }]);
    pushLog(`XOR decryption applied: key=0x${key.toString(16).toUpperCase().padStart(2, '0')}`, 'success');
    completeObjective('find_key');
    completeObjective('decrypt');
  }, [stashedChunks, pushLog, completeObjective]);

  // --- Carve ---
  const carveData = useCallback(() => {
    if (stashedChunks.length === 0) {
      pushLog('Workbench is empty. Stash fragments first.', 'error');
      return;
    }

    const combinedHex = stashedChunks.map(c => c.hex).join('');
    const ext = levelData?.target_extension || 'bin';
    const result = carveBlob(combinedHex, ext);

    if (result.text) {
      setCarvedText(result.text);
      setCarvedUrl(null);
      pushLog(`Text payload extracted: "${result.text.substring(0, 50)}${result.text.length > 50 ? '...' : ''}"`, 'success');
    } else if (result.url) {
      setCarvedUrl(result.url);
      setCarvedText(null);
      pushLog('Binary payload carved. Object rendered in Asset Viewer.', 'success');
    }

    completeObjective('carve_file');
    completeObjective('carve_flag');

    // Calcolo punteggio
    if (timerRef.current) clearInterval(timerRef.current);
    const timeElapsed = Math.floor((Date.now() - levelStartTime) / 1000);
    const meta = CAMPAIGN[currentLevelIdx];
    let levelScore = meta.maxScore;

    // Penalità hints
    levelScore -= hintsUsed * 15;

    // Bonus tempo
    if (timeElapsed <= meta.timeBonusThreshold) {
      const timeBonus = Math.round((1 - timeElapsed / meta.timeBonusThreshold) * 50);
      levelScore += timeBonus;
      pushLog(`Time bonus: +${timeBonus} points`, 'success');
    }

    levelScore = Math.max(0, levelScore);
    setScore(levelScore);
    setTotalScore(prev => prev + levelScore);
    setCompletedLevels(prev => [...prev, currentLevelIdx]);

    pushLog(`CASE CLOSED. Score: ${levelScore}/${meta.maxScore}`, 'success');
    setPhase(GAME_PHASE.VICTORY);
  }, [stashedChunks, levelData, currentLevelIdx, levelStartTime, hintsUsed, pushLog, completeObjective]);

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
        pushLog('  search <hex>      — Search for hex pattern (e.g. search 89504E47)', 'info');
        pushLog('  info              — Show current level metadata', 'info');
        pushLog('  hint              — Request an investigation hint (-15 pts)', 'info');
        pushLog('  xor <key>         — Apply XOR to workbench chunk (e.g. xor 0x1A)', 'info');
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
            if (offset === levelData.metadata.target_offset_encoded) {
              setUnlockedOffset(offset);
              pushLog(`SECTOR UNLOCKED at offset ${offset} (0x${offset.toString(16).toUpperCase()})`, 'success');
              pushLog('Encrypted sectors are now readable. Proceed with carving.', 'success');
              completeObjective('read_mbr');
              completeObjective('find_lba');
              completeObjective('calculate_offset');
              completeObjective('unlock_sector');
            } else {
              pushLog(`ACCESS DENIED: Offset ${offset} is incorrect. Review your Little-Endian calculation.`, 'error');
            }
          } else {
            pushLog(`Navigating to offset ${offset} (0x${offset.toString(16).toUpperCase()})`, 'info');
          }
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
          const idx = joined.indexOf(pattern);
          if (idx >= 0) {
            const byteIdx = idx / 2;
            pushLog(`Pattern found at byte offset ${byteIdx} (0x${byteIdx.toString(16).toUpperCase()})`, 'success');
          } else {
            pushLog(`Pattern "${pattern}" not found in current dump.`, 'error');
          }
        }
        break;

      case 'info':
        if (levelData) {
          pushLog(`Level: ${levelData.difficulty} | Extension: .${levelData.target_extension} | Target size: ${levelData.target_size} bytes`, 'info');
          if (levelData.metadata?.mbr_present) pushLog('MBR detected at offset 0. Partition table at 0x1BE.', 'info');
          if (levelData.metadata?.xor_encoded) pushLog(`XOR encryption detected. Key: 0x${levelData.metadata.xor_key.toString(16).toUpperCase().padStart(2, '0')}`, 'warning');
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

      case 'clear':
        setLogs([]);
        break;

      case 'status':
        pushLog(`--- MISSION STATUS ---`, 'system');
        objectives.forEach(o => {
          pushLog(`  ${o.completed ? '[x]' : '[ ]'} ${o.text}`, o.completed ? 'success' : 'info');
        });
        pushLog(`Hints used: ${hintsUsed} | Time: ${elapsedTime}s`, 'info');
        break;

      default:
        pushLog(`Unknown command: "${args[0]}". Type "help" for available commands.`, 'error');
    }
  }, [pushLog, levelData, hexBytes, objectives, hintsUsed, elapsedTime, completeObjective, useHint, applyXorOp]);

  // --- Reset game ---
  const resetGame = useCallback(() => {
    setPhase(GAME_PHASE.MENU);
    setCurrentLevelIdx(0);
    setLevelData(null);
    setHexBytes([]);
    setCompletedLevels([]);
    setTotalScore(0);
    setScore(0);
    setLogs([
      { type: 'system', text: 'SHATTERED BYTES Forensic Framework v2.0' },
      { type: 'system', text: 'System reset. Awaiting operator input.' },
    ]);
  }, []);

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
    carvedUrl,
    carvedText,
    unlockedOffset,
    logs,
    score,
    totalScore,
    elapsedTime,
    hintsUsed,
    objectives,

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

    // Constants
    GAME_PHASE,
    CAMPAIGN,
  };
}
