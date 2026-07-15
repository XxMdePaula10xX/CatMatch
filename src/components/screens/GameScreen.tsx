import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GameBoard } from '../board/GameBoard';
import { MovesCounter } from '../ui/MovesCounter';
import { ScoreCounter } from '../ui/ScoreCounter';
import { TimerCounter } from '../ui/TimerCounter';
import { ObjectiveCard } from '../ui/ObjectiveCard';
import { BossCatMeter } from '../ui/BossCatMeter';
import { BoosterTray } from '../ui/BoosterButton';
import { VictoryModal } from '../ui/VictoryModal';
import { DefeatModal } from '../ui/DefeatModal';
import { ResultsModal } from '../ui/ResultsModal';
import { HelpModal } from '../ui/HelpModal';
import { Button } from '../ui/Button';
import { getRelic } from '../../data/relics';

/** The main gameplay screen (shared by normal, daily and blitz modes). */
export function GameScreen() {
  const level = useGameStore((s) => s.level);
  const mode = useGameStore((s) => s.mode);
  const objectives = useGameStore((s) => s.objectives);
  const bossActive = useGameStore((s) => s.bossActive);
  const status = useGameStore((s) => s.status);
  const activeBooster = useGameStore((s) => s.activeBooster);
  const advDepth = useGameStore((s) => s.advDepth);
  const advRelics = useGameStore((s) => s.advRelics);
  const restartLevel = useGameStore((s) => s.restartLevel);
  const goHome = useGameStore((s) => s.goHome);

  const [showHelp, setShowHelp] = useState(false);

  if (!level) return null;

  const isBlitz = mode === 'blitz';
  const isAdventure = mode === 'adventure';
  const modeName =
    mode === 'daily'
      ? '📅 Diário'
      : isBlitz
        ? '⚡ Relâmpago'
        : isAdventure
          ? `🗺️ Andar ${advDepth}`
          : `Fase ${level.id}`;

  return (
    <div className="screen">
      <div className="topbar">
        <div className="topbar__row">
          {!isBlitz && <MovesCounter />}
          <TimerCounter />
          <ScoreCounter />
        </div>
        {objectives.map((o, i) => (
          <ObjectiveCard key={`${o.type}-${o.catType ?? ''}-${i}`} objective={o} />
        ))}
        {bossActive && <BossCatMeter />}
        {isAdventure && advRelics.length > 0 && (
          <div className="relic-strip">
            {advRelics.map((id, i) => (
              <span key={`${id}-${i}`} className="relic-strip__item">
                {getRelic(id)?.icon}
              </span>
            ))}
          </div>
        )}
      </div>

      {activeBooster ? (
        <p className="center muted" style={{ margin: 0 }}>
          Toque no tabuleiro para usar o booster 🎯
        </p>
      ) : (
        <p className="center muted" style={{ margin: 0, fontSize: 13 }}>
          Arraste ou toque para trocar dois gatinhos
        </p>
      )}

      <GameBoard />

      <BoosterTray />

      <div className="controls">
        <Button variant="ghost" small onClick={goHome}>
          ← Início
        </Button>
        <Button
          variant="ghost"
          small
          icon
          aria-label="Ajuda"
          onClick={() => setShowHelp(true)}
        >
          ❓
        </Button>
        <Button variant="ghost" small onClick={restartLevel}>
          🔁 {modeName}
        </Button>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {status === 'won' && <VictoryModal />}
      {status === 'lost' && <DefeatModal />}
      {status === 'finished' && <ResultsModal />}
    </div>
  );
}
