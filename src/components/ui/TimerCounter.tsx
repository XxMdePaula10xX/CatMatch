import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Shows elapsed time and ticks once per second while playing. */
export function TimerCounter() {
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="stat stat--time">
      <div className="stat__label">Tempo</div>
      <div className="stat__value">{formatTime(elapsedMs)}</div>
    </div>
  );
}
