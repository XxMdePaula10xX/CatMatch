import { useGameStore } from '../../store/gameStore';
import { computeStars } from '../../game/objectives';
import { getLevel } from '../../data/levels';
import { formatTime } from './TimerCounter';
import { Modal, Stars } from './Modal';
import { Button } from './Button';

/** Shown when the player clears the level objective. */
export function VictoryModal() {
  const score = useGameStore((s) => s.score);
  const movesLeft = useGameStore((s) => s.movesLeft);
  const totalMoves = useGameStore((s) => s.totalMoves);
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const levelId = useGameStore((s) => s.level?.id ?? 0);
  const highScore = useGameStore((s) => s.lastHighScore);
  const timeMult = useGameStore((s) => s.lastTimeMultiplier);
  const bestHigh = useGameStore((s) => s.highScores[levelId] ?? 0);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const restartLevel = useGameStore((s) => s.restartLevel);
  const goLevelSelect = useGameStore((s) => s.goLevelSelect);
  const goLeaderboard = useGameStore((s) => s.goLeaderboard);

  const stars = computeStars(movesLeft, totalMoves);
  const hasNext = !!getLevel(levelId + 1);
  const isRecord = highScore >= bestHigh;

  return (
    <Modal variant="win">
      <span className="modal__cat" aria-hidden>
        😸
      </span>
      <h2 className="modal__title">Nível Concluído!</h2>
      <Stars count={stars} />

      <div className="score-breakdown">
        <div className="score-breakdown__row">
          <span>Pontos</span>
          <span>{score.toLocaleString('pt-BR')}</span>
        </div>
        <div className="score-breakdown__row">
          <span>⏱️ Tempo ({formatTime(elapsedMs)})</span>
          <span>×{timeMult}</span>
        </div>
        <div className="score-breakdown__row total">
          <span>High Score</span>
          <span>{highScore.toLocaleString('pt-BR')}</span>
        </div>
      </div>
      {isRecord && <div className="record-badge">🎉 Novo recorde!</div>}

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
          <Button variant="purple" small block onClick={goLeaderboard}>
            🏆 Ranking
          </Button>
        </div>
      </div>
    </Modal>
  );
}
