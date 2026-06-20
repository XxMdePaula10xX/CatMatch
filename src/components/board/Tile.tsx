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
  onClick: (row: number, col: number) => void;
}

/**
 * Positions a tile absolutely within the board (so falls/swaps animate via CSS
 * transitions) and renders the correct inner visual for its type.
 */
function TileComponent({ tile, rows, cols, selected, hint, onClick }: TileProps) {
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

  const style = {
    left: `calc(${tile.col} * (100% / ${cols}))`,
    top: `calc(${tile.row} * (100% / ${rows}))`,
    width: `calc(100% / ${cols})`,
    height: `calc(100% / ${rows})`,
  };

  return (
    <div
      className={className}
      style={style}
      onClick={() => onClick(tile.row, tile.col)}
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
