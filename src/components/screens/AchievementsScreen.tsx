import { useGameStore } from '../../store/gameStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { Button } from '../ui/Button';
import { useT, tr } from '../../i18n';

/** Lists all achievements with unlocked state and progress. */
export function AchievementsScreen() {
  const t = useT();
  const goHome = useGameStore((s) => s.goHome);
  const unlocked = useGameStore((s) => s.achievements);
  const stats = useGameStore((s) => s.stats);

  const done = unlocked.length;

  return (
    <div className="screen">
      <div className="row spread">
        <Button
          variant="ghost"
          small
          icon
          aria-label={t('common.back')}
          onClick={goHome}
        >
          ←
        </Button>
        <h2 className="section-title" style={{ margin: 0 }}>
          {t('ach.title')}
        </h2>
        <div style={{ width: 50 }} />
      </div>

      <div className="panel center">
        <strong style={{ fontSize: 18 }}>
          {t('ach.unlockedCount', { done, total: ACHIEVEMENTS.length })}
        </strong>
      </div>

      <div className="stack">
        {ACHIEVEMENTS.map((a) => {
          const isDone = unlocked.includes(a.id);
          const pct = Math.round(a.progress(stats) * 100);
          return (
            <div
              key={a.id}
              className={`achievement ${isDone ? 'done' : ''}`}
            >
              <div className="achievement__icon">{isDone ? a.icon : '🔒'}</div>
              <div className="achievement__text">
                <strong>{tr(a.name)}</strong>
                <span className="muted" style={{ fontSize: 13 }}>
                  {tr(a.description)}
                </span>
                {!isDone && (
                  <div className="objective__bar" style={{ marginTop: 4 }}>
                    <div
                      className="objective__fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
              {isDone && <span className="achievement__check">✅</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
