import { useGameStore } from '../../store/gameStore';

/** Shows remaining moves; turns red and pulses when running low. */
export function MovesCounter() {
  const moves = useGameStore((s) => s.movesLeft);
  const low = moves <= 5;
  return (
    <div className={`stat stat--moves ${low ? 'stat--low' : ''}`}>
      <div className="stat__label">Movimentos</div>
      <div className="stat__value">{moves}</div>
    </div>
  );
}
