import type { Objective } from '../../game/types';
import { CATS } from '../../data/cats';

function describe(o: Objective): { icon: string; title: string } {
  switch (o.type) {
    case 'score':
      return { icon: '🏆', title: `Faça ${o.target} pontos` };
    case 'collectCat': {
      const cat = o.catType ? CATS[o.catType] : null;
      return {
        icon: cat?.emoji ?? '🐱',
        title: `Colete ${o.target} ${cat?.name ?? 'gatos'}`,
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
  const { icon, title } = describe(objective);
  const current = Math.min(objective.current ?? 0, objective.target);
  const done = current >= objective.target;
  const pct = Math.round((current / objective.target) * 100);

  return (
    <div className={`objective ${done ? 'done' : ''}`}>
      <div className="objective__icon">{done ? '✅' : icon}</div>
      <div className="objective__text">
        <div className="objective__title">{title}</div>
        <div className="objective__bar">
          <div className="objective__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="objective__count">
        {current}/{objective.target}
      </div>
    </div>
  );
}
