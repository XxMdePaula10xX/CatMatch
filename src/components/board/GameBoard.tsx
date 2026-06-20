import { useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Tile } from './Tile';
import { Particles } from './Particles';
import type { Position } from '../../game/types';

interface DragStart {
  row: number;
  col: number;
  x: number;
  y: number;
  triggered: boolean;
}

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

  function tileAt(target: EventTarget | null): Position | null {
    const el = (target as HTMLElement)?.closest?.('[data-row]') as HTMLElement | null;
    if (!el) return null;
    return { row: Number(el.dataset.row), col: Number(el.dataset.col) };
  }

  function handlePointerDown(e: React.PointerEvent) {
    const pos = tileAt(e.target);
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

  const isSelected = (r: number, c: number) =>
    !!selected && selected.row === r && selected.col === c;
  const isHint = (r: number, c: number) =>
    !!hintCells?.some((h) => h.row === r && h.col === c);

  return (
    <div className={`board-wrap ${shakeLevel >= 3 ? 'shake' : ''}`}>
      <div
        className="board"
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
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
