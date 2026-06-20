import type { ObstacleType } from '../../game/types';
import { OBSTACLES } from '../../data/obstacles';

interface ObstacleTileProps {
  obstacleType: ObstacleType;
  hp?: number;
}

/** Inner visual for an obstacle tile, with a hit-point badge when relevant. */
export function ObstacleTile({ obstacleType, hp }: ObstacleTileProps) {
  const def = OBSTACLES[obstacleType];
  return (
    <div className="tile__inner" style={{ background: undefined }}>
      <span aria-hidden>{def.emoji}</span>
      {def.removable && (hp ?? def.hp) > 1 && (
        <span className="obstacle-hp">{hp ?? def.hp}</span>
      )}
    </div>
  );
}
