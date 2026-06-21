import { memo } from 'react';
import type { Tile as TileModel } from '../../game/types';
import { CatTile } from './CatTile';
import { ObstacleTile } from './ObstacleTile';
import { YarnBallTile } from './YarnBallTile';

interface TileProps {
  tile: TileModel;
  rows: number;
  cols: number;
  selected: boolean;
  hint: boolean;
}

/**
 * Positions a tile absolutely within the board (so falls/swaps animate via CSS
 * transitions) and renders the correct inner visual for its type. Pointer
 * interaction (tap + drag) is handled by the parent board via data attributes.
 */
function TileComponent({ tile, rows, cols, selected, hint }: TileProps) {
  if (tile.type === 'empty') return null;

  const movable = tile.type === 'cat' || tile.type === 'specialCat';

  const className = [
    'tile',
    `tile--${tile.type === 'specialCat' ? 'cat' : tile.type}`,
    tile.specialType ? 'special' : '',
    movable ? 'clickable' : '',
    selected ? 'selected' : '',
    hint ? 'hint' : '',
    tile.isMatched ? 'matched' : '',
    tile.isNew ? 'spawn' : '',
    tile.isActivating ? 'activating' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Position via transform (GPU-composited) instead of top/left so falls and
  // swaps stay smooth on mobile. The tile is exactly one cell, so translating
  // by N*100% of its own size lands it on cell (row, col).
  const style = {
    width: `calc(100% / ${cols})`,
    height: `calc(100% / ${rows})`,
    transform: `translate(${tile.col * 100}%, ${tile.row * 100}%)`,
  };

  return (
    <div
      className={className}
      style={style}
      data-row={tile.row}
      data-col={tile.col}
    >
      {(tile.type === 'cat' || tile.type === 'specialCat') && tile.catType && (
        <CatTile catType={tile.catType} specialType={tile.specialType} />
      )}
      {tile.type === 'obstacle' && tile.obstacleType && (
        <ObstacleTile obstacleType={tile.obstacleType} hp={tile.hp} />
      )}
      {tile.type === 'yarn' && <YarnBallTile />}
    </div>
  );
}

export const Tile = memo(TileComponent);
