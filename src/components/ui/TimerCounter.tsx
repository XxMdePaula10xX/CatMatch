import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BLITZ_DURATION_MS } from '../../data/levels';
import { useT } from '../../i18n';

export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Shows elapsed time (or the Blitz countdown) and ticks once per second. */
export function TimerCounter() {
  const t = useT();
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const mode = useGameStore((s) => s.mode);
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const isBlitz = mode === 'blitz';
  const remaining = Math.max(0, BLITZ_DURATION_MS - elapsedMs);
  const low = isBlitz && remaining <= 10000;

  return (
    <div className={`stat stat--time ${low ? 'stat--low' : ''}`}>
      <div className="stat__label">
        {isBlitz ? t('counter.remaining') : t('counter.time')}
      </div>
      <div className="stat__value">
        {formatTime(isBlitz ? remaining : elapsedMs)}
      </div>
    </div>
  );
}
