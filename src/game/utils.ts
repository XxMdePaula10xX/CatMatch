import type { Board, Position, Tile } from './types';

let idCounter = 0;

/** Monotonic unique id for tiles (stable across a session). */
export function nextId(): string {
  idCounter += 1;
  return `t${idCounter}`;
}

export function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Deep-ish clone of the board (tiles are copied shallowly into new objects). */
export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((tile) => ({ ...tile })));
}

export function inBounds(board: Board, row: number, col: number): boolean {
  return (
    row >= 0 && row < board.length && col >= 0 && col < (board[0]?.length ?? 0)
  );
}

export function areAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return dr + dc === 1;
}

/** Orthogonal neighbours of a cell that lie on the board. */
export function neighbors(board: Board, pos: Position): Tile[] {
  const deltas = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];
  const result: Tile[] = [];
  for (const d of deltas) {
    const r = pos.row + d.row;
    const c = pos.col + d.col;
    if (inBounds(board, r, c)) result.push(board[r][c]);
  }
  return result;
}

export function forEachTile(board: Board, fn: (tile: Tile) => void): void {
  for (const row of board) for (const tile of row) fn(tile);
}

/** True for tiles that act as a fixed wall (block falling / are immovable). */
export function isBlocking(tile: Tile): boolean {
  return tile.type === 'obstacle' || tile.type === 'yarn';
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
