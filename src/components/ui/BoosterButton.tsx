import { useGameStore } from '../../store/gameStore';
import { BOOSTERS, BOOSTER_ORDER } from '../../data/boosters';

/** The booster tray. Implemented boosters are tappable; others are previews. */
export function BoosterTray() {
  const activeBooster = useGameStore((s) => s.activeBooster);
  const boosterUses = useGameStore((s) => s.boosterUses);
  const selectBooster = useGameStore((s) => s.selectBooster);

  return (
    <div className="boosters">
      {BOOSTER_ORDER.map((id) => {
        const def = BOOSTERS[id];
        const uses = boosterUses[id] ?? 0;
        const usable = def.implemented;
        return (
          <button
            key={id}
            className={[
              'booster',
              activeBooster === id ? 'active' : '',
              usable ? '' : 'locked',
            ]
              .filter(Boolean)
              .join(' ')}
            title={`${def.name} — ${def.description}`}
            disabled={!usable || uses <= 0}
            onClick={() => usable && selectBooster(id)}
          >
            <span aria-hidden>{def.emoji}</span>
            {usable ? (
              <span className="booster__count">{uses}</span>
            ) : (
              <span className="booster__count" style={{ background: '#b0a48f' }}>
                🔒
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
