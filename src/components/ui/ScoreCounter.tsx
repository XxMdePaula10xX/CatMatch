import { useGameStore } from '../../store/gameStore';

/** Shows the current level score. */
export function ScoreCounter() {
  const score = useGameStore((s) => s.score);
  return (
    <div className="stat stat--score">
      <div className="stat__label">Pontos</div>
      <div className="stat__value">{score.toLocaleString('pt-BR')}</div>
    </div>
  );
}
