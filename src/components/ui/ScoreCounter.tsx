import { useGameStore } from '../../store/gameStore';
import { useT, nf } from '../../i18n';

/** Shows the current level score. */
export function ScoreCounter() {
  const t = useT();
  const score = useGameStore((s) => s.score);
  return (
    <div className="stat stat--score">
      <div className="stat__label">{t('counter.score')}</div>
      <div className="stat__value">{nf(score)}</div>
    </div>
  );
}
