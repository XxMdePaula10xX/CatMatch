import { useMemo, useState } from 'react';
import type { CatType, SpecialCatType } from '../../game/types';
import { CATS, SPECIAL_CATS, CAT_IMAGE, SPECIAL_IMAGE } from '../../data/cats';

interface CatTileProps {
  catType: CatType;
  specialType?: SpecialCatType;
}

/**
 * Inner visual for a basic or special cat tile. Renders the final PNG art when
 * present in `public/cats/`; otherwise gracefully falls back to the emoji.
 */
export function CatTile({ catType, specialType }: CatTileProps) {
  const def = CATS[catType];
  // Track WHICH url failed (not a permanent latch), so a re-render or an
  // in-place cat transform retries the image instead of sticking on the emoji.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const src = specialType ? SPECIAL_IMAGE[specialType] : CAT_IMAGE[catType];
  const emoji = specialType ? SPECIAL_CATS[specialType].emoji : def.emoji;
  const imgFailed = failedSrc === src;

  // Memoized: the gradient only depends on the cat type, not on re-renders.
  const background = useMemo(
    () =>
      `radial-gradient(circle at 35% 28%, ${lighten(def.color)}, ${def.color} 60%, ${def.colorDark})`,
    [def.color, def.colorDark],
  );

  return (
    <div className="tile__inner" style={{ background }}>
      {imgFailed ? (
        <span aria-hidden>{emoji}</span>
      ) : (
        <img
          className="tile__img"
          src={src}
          alt=""
          draggable={false}
          onError={() => setFailedSrc(src)}
        />
      )}
      {specialType && (
        <span className="tile__special-badge" aria-hidden>
          ⭐
        </span>
      )}
    </div>
  );
}

/** Quick lighten by blending toward white for the glossy top of the tile. */
function lighten(hex: string): string {
  const c = hex.replace('#', '');
  const n = parseInt(
    c.length === 3
      ? c
          .split('')
          .map((x) => x + x)
          .join('')
      : c,
    16,
  );
  const r = Math.min(255, ((n >> 16) & 255) + 60);
  const g = Math.min(255, ((n >> 8) & 255) + 60);
  const b = Math.min(255, (n & 255) + 60);
  return `rgb(${r},${g},${b})`;
}
