import useGameState from './hooks/useGameState';
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

export default function App() {
  const game = useGameState();
  const { GAME_PHASE, CAMPAIGN } = game;

  // --- Main Menu ---
  if (game.phase === GAME_PHASE.MENU) {
    return (
      <MainMenu
        onStart={() => game.loadLevel(game.completedLevels.length > 0 ? Math.min(game.completedLevels.length, CAMPAIGN.length - 1) : 0)}
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
      />

      {/* Main layout */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-hidden">

        {/* Left sidebar */}
        <aside className="w-72 flex flex-col gap-3 shrink-0 overflow-y-auto min-h-0">
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

          <Workbench
            chunks={game.stashedChunks}
            onRemove={game.removeStash}
            onMove={game.moveStash}
            onCarve={game.carveData}
            onXor={game.applyXorOp}
            levelData={game.levelData}
          />
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
          />

          <AssetViewer
            carvedUrl={game.carvedUrl}
            carvedText={game.carvedText}
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
