import { useState } from 'react';
import type { ObstacleType } from '../../game/types';
import { OBSTACLES, OBSTACLE_IMAGE } from '../../data/obstacles';

interface ObstacleTileProps {
  obstacleType: ObstacleType;
  hp?: number;
}

/**
 * Inner visual for an obstacle tile. Renders the custom SVG art, gracefully
 * falling back to the emoji if the image fails, and shows a hit-point badge
 * when relevant.
 */
export function ObstacleTile({ obstacleType, hp }: ObstacleTileProps) {
  const def = OBSTACLES[obstacleType];
  const src = OBSTACLE_IMAGE[obstacleType];
  // Track WHICH url failed (not a permanent latch) so a type change retries.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgFailed = failedSrc === src;

  return (
    <div className="tile__inner" style={{ background: undefined }}>
      {imgFailed ? (
        <span aria-hidden>{def.emoji}</span>
      ) : (
        <img
          className="tile__img"
          src={src}
          alt=""
          draggable={false}
          onError={() => setFailedSrc(src)}
        />
      )}
      {def.removable && (hp ?? def.hp) > 1 && (
        <span className="obstacle-hp">{hp ?? def.hp}</span>
      )}
    </div>
  );
}
