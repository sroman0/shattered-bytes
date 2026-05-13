import { useState, useCallback } from 'react';
import useGameState from './hooks/useGameState';
import BootSequence from './components/BootSequence';
import Tutorial from './components/Tutorial';
import Header from './components/Header';
import MainMenu from './components/MainMenu';
import Briefing from './components/Briefing';
import MissionLog from './components/MissionLog';
import ObjectivesPanel from './components/ObjectivesPanel';
import Terminal from './components/Terminal';
import Workbench from './components/Workbench';
import HexEditor from './components/HexEditor';
import AssetViewer from './components/AssetViewer';
import ScoreBoard from './components/ScoreBoard';
import EvidenceJournal from './components/EvidenceJournal';
import SignatureReference from './components/SignatureReference';
import ForensicNotepad from './components/ForensicNotepad';
import InvestigationTimeline from './components/InvestigationTimeline';

export default function App() {
  const game = useGameState();
  const { GAME_PHASE, CAMPAIGN } = game;
  const [hasNotes, setHasNotes] = useState(false);
  const [showBoot, setShowBoot] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialSeen, setTutorialSeen] = useState(() => {
    try { return localStorage.getItem('shattered_bytes_tutorial_seen') === '1'; } catch { return false; }
  });

  const handleBootComplete = useCallback(() => {
    setShowBoot(false);
  }, []);

  const handleStartGame = useCallback(() => {
    const nextLevelIdx = game.completedLevels.length > 0 ? Math.min(game.completedLevels.length, CAMPAIGN.length - 1) : 0;

    // Show tutorial only on first play
    if (!tutorialSeen) {
      setShowTutorial(true);
      // Store the level to load after tutorial
      window.__pendingLevel = nextLevelIdx;
    } else {
      game.loadLevel(nextLevelIdx);
    }
  }, [game, tutorialSeen, CAMPAIGN.length]);



  const handleHowToPlay = useCallback(() => {
    setShowTutorial(true);
    // Mark that after tutorial we go back to menu, not start a level
    window.__pendingLevel = null;
  }, []);

  const handleTutorialCompleteToMenu = useCallback(() => {
    setShowTutorial(false);
    setTutorialSeen(true);
    try { localStorage.setItem('shattered_bytes_tutorial_seen', '1'); } catch { /* ignore */ }
    // If there was a pending level, load it; otherwise just go back to menu
    const pendingLevel = window.__pendingLevel;
    delete window.__pendingLevel;
    if (pendingLevel !== null && pendingLevel !== undefined) {
      game.loadLevel(pendingLevel);
    }
    // else: stay on menu
  }, [game]);

  // --- Boot Sequence ---
  if (showBoot) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  // --- Tutorial overlay ---
  if (showTutorial) {
    return <Tutorial onComplete={handleTutorialCompleteToMenu} />;
  }

  // --- Main Menu ---
  if (game.phase === GAME_PHASE.MENU) {
    return (
      <MainMenu
        onStart={handleStartGame}
        onHowToPlay={handleHowToPlay}
        completedLevels={game.completedLevels}
        totalScore={game.totalScore}
      />
    );
  }

  // --- Briefing overlay ---
  const showBriefing = game.phase === GAME_PHASE.BRIEFING && game.currentLevel;

  return (
    <div className="h-screen bg-gray-950 text-green-400 font-mono flex flex-col overflow-hidden"
         onMouseUp={game.endSelection}>

      {/* Briefing modal */}
      {showBriefing && (
        <Briefing level={game.currentLevel} onStart={game.startPlaying} />
      )}

      {/* Score / Victory / Campaign end overlays */}
      <ScoreBoard
        score={game.score}
        totalScore={game.totalScore}
        currentLevel={game.currentLevel}
        objectives={game.objectives}
        hintsUsed={game.hintsUsed}
        elapsedTime={game.elapsedTime}
        caseResults={game.caseResults}
        latestCaseResult={game.latestCaseResult}
        onNext={game.nextLevel}
        onRestart={game.resetGame}
        isLastLevel={game.currentLevelIdx >= CAMPAIGN.length - 1}
        phase={game.phase}
        GAME_PHASE={GAME_PHASE}
      />

      {/* Header */}
      <Header
        totalScore={game.totalScore}
        elapsedTime={game.elapsedTime}
        phase={game.phase}
        GAME_PHASE={GAME_PHASE}
        objectives={game.objectives}
        onReturnToTitle={game.returnToMenu}
        onSettings={(action) => {
          if (action === 'tutorial') {
            setShowTutorial(true);
            window.__pendingLevel = null;
          }
        }}
      />

      {/* Main layout */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-hidden">

        {/* Left sidebar */}
        <aside className="w-72 flex flex-col gap-3 shrink-0 overflow-y-auto min-h-0 pr-1 pb-3">
          <MissionLog
            currentLevelIdx={game.currentLevelIdx}
            completedLevels={game.completedLevels}
            levelData={game.levelData}
            onSelectLevel={game.loadLevel}
            phase={game.phase}
            GAME_PHASE={GAME_PHASE}
          />

          {game.phase === GAME_PHASE.PLAYING && (
            <ObjectivesPanel
              objectives={game.objectives}
              onHint={game.useHint}
              hintsUsed={game.hintsUsed}
              currentLevel={game.currentLevel}
            />
          )}

          <SignatureReference />

          <ForensicNotepad onNoteChange={(text) => setHasNotes(text.length > 0)} />

          <Workbench
            chunks={game.stashedChunks}
            onRemove={game.removeStash}
            onMove={game.moveStash}
            onCarve={game.carveData}
            onXor={game.applyXorOp}
            levelData={game.levelData}
          />

          <EvidenceJournal
            entries={game.journalEntries}
            badSelections={game.badSelections}
            carveAttempts={game.carveAttempts}
            pendingCaseResult={game.pendingCaseResult}
          />

          {game.phase === GAME_PHASE.PLAYING && game.timelineEvents.length > 0 && (
            <InvestigationTimeline events={game.timelineEvents} />
          )}
        </aside>

        {/* Center: hex editor + asset viewer */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 min-h-0">
          <HexEditor
            hexBytes={game.hexBytes}
            selectionStart={game.selectionStart}
            selectionEnd={game.selectionEnd}
            onBeginSelection={game.beginSelection}
            onExtendSelection={game.extendSelection}
            onEndSelection={game.endSelection}
            onStash={game.stashSelection}
            unlockedOffset={game.unlockedOffset}
            levelData={game.levelData}
            goToOffsetTrigger={game.goToOffsetTrigger}
            stashedChunks={game.stashedChunks}
          />

          <AssetViewer
            carvedUrl={game.carvedUrl}
            carvedText={game.carvedText}
            currentLevelId={game.currentLevel?.id}
          />
        </div>

        {/* Right sidebar: Terminal */}
        <aside className="w-80 flex flex-col shrink-0 min-h-0">
          <Terminal
            logs={game.logs}
            onCommand={game.executeCommand}
          />
        </aside>
      </div>
    </div>
  );
}
