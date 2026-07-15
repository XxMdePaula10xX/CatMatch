import { useGameStore } from '../../store/gameStore';
import { levels, campaignLevelName } from '../../data/levels';
import { Button } from '../ui/Button';
import type { Objective } from '../../game/types';
import { useT, t } from '../../i18n';

function goalLabel(objectives: Objective[]): string {
  const o = objectives[0];
  switch (o.type) {
    case 'score':
      return t('goal.score', { n: o.target });
    case 'collectCat':
      return t('goal.collect', { n: o.target });
    case 'breakBox':
      return t('goal.boxes', { n: o.target });
    case 'activateYarn':
      return t('goal.yarns', { n: o.target });
    case 'chargeBoss':
      return t('goal.boss', { n: o.target });
    default:
      return '';
  }
}

/** Level map: cards with stars and locked indicators. */
export function LevelSelectScreen() {
  const tt = useT();
  const goHome = useGameStore((s) => s.goHome);
  const startLevel = useGameStore((s) => s.startLevel);
  const unlocked = useGameStore((s) => s.unlockedLevel);
  const stars = useGameStore((s) => s.starsByLevel);

  return (
    <div className="screen">
      <div className="row spread">
        <Button
          variant="ghost"
          small
          icon
          aria-label={tt('common.back')}
          onClick={goHome}
        >
          ←
        </Button>
        <h2 className="section-title" style={{ margin: 0 }}>
          {tt('levelSelect.title')}
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
              <div className="level-card__name">
                {campaignLevelName(level.id)}
              </div>
              <div className="level-card__goal">
                {goalLabel(level.objectives)}
              </div>
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
