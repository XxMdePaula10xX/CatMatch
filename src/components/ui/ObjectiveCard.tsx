import type { Objective } from '../../game/types';
import { CATS, CAT_IMAGE } from '../../data/cats';
import { useT, t, nf, tr } from '../../i18n';

function describe(o: Objective): { icon: string; title: string; img?: string } {
  switch (o.type) {
    case 'score':
      return { icon: '🏆', title: t('obj.score', { n: nf(o.target) }) };
    case 'collectCat': {
      const cat = o.catType ? CATS[o.catType] : null;
      return {
        icon: cat?.emoji ?? '🐱',
        img: o.catType ? CAT_IMAGE[o.catType] : undefined,
        title: t('obj.collect', {
          n: o.target,
          cat: cat ? tr(cat.name) : t('obj.collectFallback'),
        }),
      };
    }
    case 'breakBox':
      return { icon: '📦', title: t('obj.breakBox', { n: o.target }) };
    case 'activateYarn':
      return { icon: '🧶', title: t('obj.yarn', { n: o.target }) };
    case 'chargeBoss':
      return { icon: '👑', title: t('obj.boss', { n: o.target }) };
    default:
      return { icon: '⭐', title: t('obj.default') };
  }
}

/** A single level objective with a progress bar. */
export function ObjectiveCard({ objective }: { objective: Objective }) {
  useT();
  const { icon, title, img } = describe(objective);
  const current = Math.min(objective.current ?? 0, objective.target);
  const done = current >= objective.target;
  const pct = Math.round((current / objective.target) * 100);

  return (
    <div className={`objective ${done ? 'done' : ''}`}>
      <div className="objective__icon">
        {done ? (
          '✅'
        ) : img ? (
          <img className="objective__img" src={img} alt="" aria-hidden />
        ) : (
          icon
        )}
      </div>
      <div className="objective__text">
        <div className="objective__title">{title}</div>
        <div className="objective__bar">
          <div className="objective__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="objective__count">
        {nf(current)}/{nf(objective.target)}
      </div>
    </div>
  );
}
