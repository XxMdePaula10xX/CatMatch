import { memo, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Tile } from './Tile';
import { Particles } from './Particles';
import type { Board, Position } from '../../game/types';

interface DragStart {
  row: number;
  col: number;
  x: number;
  y: number;
  triggered: boolean;
}

/** Static checkered backdrop — memoized so FX updates never re-render it. */
const BoardCells = memo(function BoardCells({
  rows,
  cols,
}: {
  rows: number;
  cols: number;
}) {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(
        <div
          key={`cell-${r}-${c}`}
          className={`board__cell ${(r + c) % 2 === 0 ? 'dark' : ''}`}
          style={{
            left: `calc(${c} * (100% / ${cols}))`,
            top: `calc(${r} * (100% / ${rows}))`,
            width: `calc(100% / ${cols})`,
            height: `calc(100% / ${rows})`,
          }}
        />,
      );
    }
  }
  return <>{cells}</>;
});

/**
 * The tile layer. Memoized so that frequent FX state (particles, floating
 * scores, toasts, combo/shake) doesn't recreate 64 tiles every update — it only
 * re-renders when the board, selection, or hint actually change.
 */
const TilesLayer = memo(function TilesLayer({
  board,
  rows,
  cols,
  selected,
  hintCells,
}: {
  board: Board;
  rows: number;
  cols: number;
  selected: Position | null;
  hintCells: Position[] | null;
}) {
  const isSelected = (r: number, c: number) =>
    !!selected && selected.row === r && selected.col === c;
  const isHint = (r: number, c: number) =>
    !!hintCells?.some((h) => h.row === r && h.col === c);

  return (
    <>
      {board.flat().map((tile) =>
        tile.type === 'empty' ? null : (
          <Tile
            key={tile.id}
            tile={tile}
            rows={rows}
            cols={cols}
            selected={isSelected(tile.row, tile.col)}
            hint={isHint(tile.row, tile.col)}
          />
        ),
      )}
    </>
  );
});

/** The 8x8 playfield: checkered backdrop, animated tiles, and FX overlays. */
export function GameBoard() {
  const board = useGameStore((s) => s.board);
  const selected = useGameStore((s) => s.selected);
  const hintCells = useGameStore((s) => s.hintCells);
  const floaters = useGameStore((s) => s.floatingScores);
  const toasts = useGameStore((s) => s.toasts);
  const comboLevel = useGameStore((s) => s.comboLevel);
  const shakeLevel = useGameStore((s) => s.shakeLevel);
  const onTileClick = useGameStore((s) => s.onTileClick);
  const onTileDrag = useGameStore((s) => s.onTileDrag);

  const drag = useRef<DragStart | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  if (rows === 0) return null;

  function cellSize(): number {
    const el = boardRef.current;
    return el ? el.clientWidth / cols : 40;
  }

  // Map a screen point to a grid cell using the board's own (untransformed)
  // rect. This is immune to an iOS/WebKit quirk where hit-testing against the
  // GPU-composited, `transform`-positioned tiles could return a neighbouring
  // row — the cell you tap now always matches the cell you see.
  function cellFromPoint(clientX: number, clientY: number): Position | null {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const col = Math.floor(((clientX - rect.left) / rect.width) * cols);
    const row = Math.floor(((clientY - rect.top) / rect.height) * rows);
    if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
    return { row, col };
  }

  function handlePointerDown(e: React.PointerEvent) {
    const pos = cellFromPoint(e.clientX, e.clientY);
    if (!pos) return;
    drag.current = { ...pos, x: e.clientX, y: e.clientY, triggered: false };
  }

  function handlePointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || d.triggered) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const threshold = Math.max(12, cellSize() * 0.35);
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

    d.triggered = true;
    let to: Position;
    if (Math.abs(dx) > Math.abs(dy)) {
      to = { row: d.row, col: d.col + (dx > 0 ? 1 : -1) };
    } else {
      to = { row: d.row + (dy > 0 ? 1 : -1), col: d.col };
    }
    onTileDrag({ row: d.row, col: d.col }, to);
  }

  function handlePointerUp() {
    const d = drag.current;
    if (d && !d.triggered) onTileClick({ row: d.row, col: d.col });
    drag.current = null;
  }

  // Pointer leaving the board mid-gesture cancels it (don't treat as a tap).
  function handlePointerLeave() {
    drag.current = null;
  }

  return (
    <div className={`board-wrap ${shakeLevel >= 3 ? 'shake' : ''}`}>
      <div
        className="board"
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <BoardCells rows={rows} cols={cols} />

        <TilesLayer
          board={board}
          rows={rows}
          cols={cols}
          selected={selected}
          hintCells={hintCells}
        />

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

        <Particles rows={rows} cols={cols} />

        {comboLevel >= 2 && (
          <div className="combo-banner">Combo x{comboLevel}! 🐾</div>
        )}

        <div className="toasts">
          {toasts.map((t) => (
            <div key={t.id} className="toast">
              {t.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
