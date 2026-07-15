import { useGameStore } from '../../store/gameStore';
import { useT } from '../../i18n';

/** Shows remaining moves; turns red and pulses when running low. */
export function MovesCounter() {
  const t = useT();
  const moves = useGameStore((s) => s.movesLeft);
  const low = moves <= 5;
  return (
    <div className={`stat stat--moves ${low ? 'stat--low' : ''}`}>
      <div className="stat__label">{t('counter.moves')}</div>
      <div className="stat__value">{moves}</div>
    </div>
  );
}
