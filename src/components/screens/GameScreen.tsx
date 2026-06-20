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
import { HelpModal } from '../ui/HelpModal';
import { Button } from '../ui/Button';

/** The main gameplay screen. */
export function GameScreen() {
  const level = useGameStore((s) => s.level);
  const objectives = useGameStore((s) => s.objectives);
  const bossActive = useGameStore((s) => s.bossActive);
  const status = useGameStore((s) => s.status);
  const activeBooster = useGameStore((s) => s.activeBooster);
  const restartLevel = useGameStore((s) => s.restartLevel);
  const goLevelSelect = useGameStore((s) => s.goLevelSelect);

  const [showHelp, setShowHelp] = useState(false);

  if (!level) return null;

  return (
    <div className="screen">
      <div className="topbar">
        <div className="topbar__row">
          <MovesCounter />
          <TimerCounter />
          <ScoreCounter />
        </div>
        {objectives.map((o, i) => (
          <ObjectiveCard key={i} objective={o} />
        ))}
        {bossActive && <BossCatMeter />}
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
        <Button variant="ghost" small onClick={goLevelSelect}>
          ← Voltar
        </Button>
        <Button variant="ghost" small icon onClick={() => setShowHelp(true)}>
          ❓
        </Button>
        <Button variant="ghost" small onClick={restartLevel}>
          🔁 Reiniciar
        </Button>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {status === 'won' && <VictoryModal />}
      {status === 'lost' && <DefeatModal />}
    </div>
  );
}
