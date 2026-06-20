import { useGameStore } from '../../store/gameStore';
import { Tile } from './Tile';

/** The 8x8 playfield: checkered backdrop, animated tiles, and FX overlays. */
export function GameBoard() {
  const board = useGameStore((s) => s.board);
  const selected = useGameStore((s) => s.selected);
  const hintCells = useGameStore((s) => s.hintCells);
  const floaters = useGameStore((s) => s.floatingScores);
  const comboLevel = useGameStore((s) => s.comboLevel);
  const onTileClick = useGameStore((s) => s.onTileClick);

  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  if (rows === 0) return null;

  const isSelected = (r: number, c: number) =>
    !!selected && selected.row === r && selected.col === c;
  const isHint = (r: number, c: number) =>
    !!hintCells?.some((h) => h.row === r && h.col === c);

  return (
    <div className="board-wrap">
      <div className="board">
        {/* checkered cell backdrop */}
        {board.map((row, r) =>
          row.map((_, c) => (
            <div
              key={`cell-${r}-${c}`}
              className={`board__cell ${(r + c) % 2 === 0 ? 'dark' : ''}`}
              style={{
                left: `calc(${c} * (100% / ${cols}))`,
                top: `calc(${r} * (100% / ${rows}))`,
                width: `calc(100% / ${cols})`,
                height: `calc(100% / ${rows})`,
              }}
            />
          )),
        )}

        {/* tiles, keyed by stable id so CSS transitions animate movement */}
        {board.flat().map((tile) =>
          tile.type === 'empty' ? null : (
            <Tile
              key={tile.id}
              tile={tile}
              rows={rows}
              cols={cols}
              selected={isSelected(tile.row, tile.col)}
              hint={isHint(tile.row, tile.col)}
              onClick={(r, c) => onTileClick({ row: r, col: c })}
            />
          ),
        )}

        {/* floating score popups */}
        {floaters.map((f) => (
          <div
            key={f.id}
            className="floater"
            style={{
              left: `calc(${f.col + 0.5} * (100% / ${cols}))`,
              top: `calc(${f.row + 0.2} * (100% / ${rows}))`,
            }}
          >
            +{f.value}
          </div>
        ))}

        {comboLevel >= 2 && (
          <div className="combo-banner">Combo x{comboLevel}! 🐾</div>
        )}
      </div>
    </div>
  );
}
