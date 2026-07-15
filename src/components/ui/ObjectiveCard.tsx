import type { Objective } from '../../game/types';
import { CATS, CAT_IMAGE } from '../../data/cats';

const nf = (n: number) => n.toLocaleString('pt-BR');

function describe(o: Objective): { icon: string; title: string; img?: string } {
  switch (o.type) {
    case 'score':
      return { icon: '🏆', title: `Faça ${nf(o.target)} pontos` };
    case 'collectCat': {
      const cat = o.catType ? CATS[o.catType] : null;
      return {
        icon: cat?.emoji ?? '🐱',
        img: o.catType ? CAT_IMAGE[o.catType] : undefined,
        title: `Colete ${o.target}x ${cat?.name ?? 'gatos'}`,
      };
    }
    case 'breakBox':
      return { icon: '📦', title: `Quebre ${o.target} caixas` };
    case 'activateYarn':
      return { icon: '🧶', title: `Ative ${o.target} novelos` };
    case 'chargeBoss':
      return { icon: '👑', title: `Carregue o Gato Chefe ${o.target}x` };
    default:
      return { icon: '⭐', title: 'Objetivo' };
  }
}

/** A single level objective with a progress bar. */
export function ObjectiveCard({ objective }: { objective: Objective }) {
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
