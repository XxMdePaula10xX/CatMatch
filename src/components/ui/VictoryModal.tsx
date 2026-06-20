import { useGameStore } from '../../store/gameStore';
import { computeStars } from '../../game/objectives';
import { getLevel } from '../../data/levels';
import { Modal, Stars } from './Modal';
import { Button } from './Button';

/** Shown when the player clears the level objective. */
export function VictoryModal() {
  const score = useGameStore((s) => s.score);
  const movesLeft = useGameStore((s) => s.movesLeft);
  const totalMoves = useGameStore((s) => s.totalMoves);
  const levelId = useGameStore((s) => s.level?.id ?? 0);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const restartLevel = useGameStore((s) => s.restartLevel);
  const goLevelSelect = useGameStore((s) => s.goLevelSelect);

  const stars = computeStars(movesLeft, totalMoves);
  const hasNext = !!getLevel(levelId + 1);

  return (
    <Modal variant="win">
      <span className="modal__cat" aria-hidden>
        😸
      </span>
      <h2 className="modal__title">Nível Concluído!</h2>
      <Stars count={stars} />
      <div className="modal__score">{score.toLocaleString('pt-BR')} pontos</div>
      <div className="stack">
        {hasNext ? (
          <Button variant="green" block onClick={nextLevel}>
            Continuar ▶
          </Button>
        ) : (
          <Button variant="green" block onClick={goLevelSelect}>
            Mapa de Fases
          </Button>
        )}
        <div className="row">
          <Button variant="ghost" small block onClick={restartLevel}>
            🔁 Repetir
          </Button>
          <Button variant="ghost" small block onClick={goLevelSelect}>
            🏠 Fases
          </Button>
        </div>
      </div>
    </Modal>
  );
}
