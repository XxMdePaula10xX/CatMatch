import type { CatType, SpecialCatType } from '../../game/types';
import { CATS, SPECIAL_CATS } from '../../data/cats';

interface CatTileProps {
  catType: CatType;
  specialType?: SpecialCatType;
}

/** Inner visual for a basic or special cat tile. */
export function CatTile({ catType, specialType }: CatTileProps) {
  const def = CATS[catType];
  const background = `radial-gradient(circle at 35% 28%, ${lighten(
    def.color,
  )}, ${def.color} 60%, ${def.colorDark})`;

  return (
    <div className="tile__inner" style={{ background }}>
      <span aria-hidden>{specialType ? SPECIAL_CATS[specialType].emoji : def.emoji}</span>
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
