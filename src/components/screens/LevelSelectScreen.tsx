import { useGameStore } from '../../store/gameStore';
import { levels } from '../../data/levels';
import { Button } from '../ui/Button';
import type { Objective } from '../../game/types';

function goalLabel(objectives: Objective[]): string {
  const o = objectives[0];
  switch (o.type) {
    case 'score':
      return `${o.target} pts`;
    case 'collectCat':
      return `Colete ${o.target}`;
    case 'breakBox':
      return `${o.target} caixas`;
    case 'activateYarn':
      return `${o.target} novelos`;
    case 'chargeBoss':
      return `Chefe ${o.target}x`;
    default:
      return '';
  }
}

/** Level map: cards with stars and locked indicators. */
export function LevelSelectScreen() {
  const goHome = useGameStore((s) => s.goHome);
  const startLevel = useGameStore((s) => s.startLevel);
  const unlocked = useGameStore((s) => s.unlockedLevel);
  const stars = useGameStore((s) => s.starsByLevel);

  return (
    <div className="screen">
      <div className="row spread">
        <Button variant="ghost" small icon onClick={goHome}>
          ←
        </Button>
        <h2 className="section-title" style={{ margin: 0 }}>
          Escolha uma Fase
        </h2>
        <div style={{ width: 50 }} />
      </div>

      <div className="levels-grid">
        {levels.map((level) => {
          const locked = level.id > unlocked;
          const earned = stars[level.id] ?? 0;
          return (
            <button
              key={level.id}
              className={`level-card ${locked ? 'locked' : ''}`}
              disabled={locked}
              onClick={() => !locked && startLevel(level.id)}
            >
              <div className="level-card__num">
                {locked ? (
                  <span className="level-card__lock">🔒</span>
                ) : (
                  level.id
                )}
              </div>
              <div className="level-card__name">{level.name}</div>
              <div className="level-card__goal">{goalLabel(level.objectives)}</div>
              <div className="level-card__stars">
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ opacity: i < earned ? 1 : 0.3 }}>
                    ⭐
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
