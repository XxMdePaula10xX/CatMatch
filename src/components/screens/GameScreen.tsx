import { useGameStore } from '../../store/gameStore';
import { GameBoard } from '../board/GameBoard';
import { MovesCounter } from '../ui/MovesCounter';
import { ScoreCounter } from '../ui/ScoreCounter';
import { ObjectiveCard } from '../ui/ObjectiveCard';
import { BossCatMeter } from '../ui/BossCatMeter';
import { BoosterTray } from '../ui/BoosterButton';
import { VictoryModal } from '../ui/VictoryModal';
import { DefeatModal } from '../ui/DefeatModal';
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

  if (!level) return null;

  return (
    <div className="screen">
      <div className="topbar">
        <div className="topbar__row">
          <MovesCounter />
          <ScoreCounter />
        </div>
        {objectives.map((o, i) => (
          <ObjectiveCard key={i} objective={o} />
        ))}
        {bossActive && <BossCatMeter />}
      </div>

      {activeBooster && (
        <p className="center muted" style={{ margin: 0 }}>
          Toque no tabuleiro para usar o booster 🎯
        </p>
      )}

      <GameBoard />

      <BoosterTray />

      <div className="controls">
        <Button variant="ghost" small onClick={goLevelSelect}>
          ← Voltar
        </Button>
        <span className="muted">Fase {level.id} · {level.name}</span>
        <Button variant="ghost" small onClick={restartLevel}>
          🔁 Reiniciar
        </Button>
      </div>

      {status === 'won' && <VictoryModal />}
      {status === 'lost' && <DefeatModal />}
    </div>
  );
}
