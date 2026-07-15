import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  BOOSTERS,
  BOOSTER_ORDER,
  BOOSTER_IMAGE,
  type BoosterId,
} from '../../data/boosters';

/** Booster icon: custom SVG art with an emoji fallback if the image fails. */
function BoosterIcon({ id }: { id: BoosterId }) {
  const def = BOOSTERS[id];
  const src = BOOSTER_IMAGE[id];
  const [failed, setFailed] = useState(false);
  if (failed) return <span aria-hidden>{def.emoji}</span>;
  return (
    <img
      className="booster__img"
      src={src}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

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
            <BoosterIcon id={id} />
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
