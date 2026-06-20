import type {
  Board,
  CatType,
  Position,
  SpecialCatType,
  Tile,
} from './types';

export interface MatchGroup {
  catType: CatType;
  positions: Position[];
  size: number;
  /** Length of the longest straight run within the group. */
  maxRunLength: number;
  hasHorizontal: boolean;
  hasVertical: boolean;
}

export interface SpecialCreation {
  pos: Position;
  special: SpecialCatType;
  catType: CatType;
}

export interface MatchResult {
  /** Every cell that is part of any match (de-duplicated). */
  matchedPositions: Position[];
  groups: MatchGroup[];
  creations: SpecialCreation[];
}

interface Run {
  orientation: 'h' | 'v';
  positions: Position[];
  catType: CatType;
}

function isMatchable(tile: Tile): tile is Tile & { catType: CatType } {
  return (
    (tile.type === 'cat' || tile.type === 'specialCat') &&
    tile.catType !== undefined
  );
}

function key(p: Position): string {
  return `${p.row},${p.col}`;
}

function collectRuns(board: Board): Run[] {
  const runs: Run[] = [];
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  // Horizontal runs.
  for (let r = 0; r < rows; r++) {
    let start = 0;
    while (start < cols) {
      const tile = board[r][start];
      if (!isMatchable(tile)) {
        start += 1;
        continue;
      }
      let end = start + 1;
      while (
        end < cols &&
        isMatchable(board[r][end]) &&
        board[r][end].catType === tile.catType
      ) {
        end += 1;
      }
      const len = end - start;
      if (len >= 3) {
        const positions: Position[] = [];
        for (let c = start; c < end; c++) positions.push({ row: r, col: c });
        runs.push({ orientation: 'h', positions, catType: tile.catType });
      }
      start = end;
    }
  }

  // Vertical runs.
  for (let c = 0; c < cols; c++) {
    let start = 0;
    while (start < rows) {
      const tile = board[start][c];
      if (!isMatchable(tile)) {
        start += 1;
        continue;
      }
      let end = start + 1;
      while (
        end < rows &&
        isMatchable(board[end][c]) &&
        board[end][c].catType === tile.catType
      ) {
        end += 1;
      }
      const len = end - start;
      if (len >= 3) {
        const positions: Position[] = [];
        for (let r = start; r < end; r++) positions.push({ row: r, col: c });
        runs.push({ orientation: 'v', positions, catType: tile.catType });
      }
      start = end;
    }
  }

  return runs;
}

/**
 * Detects all matches on the board and decides which special cats should be
 * created. Runs are merged into connected groups so that an L/T shape counts
 * as a single match and yields an Angry Cat, etc.
 */
export function findMatches(
  board: Board,
  swapped: Position[] = [],
): MatchResult {
  const runs = collectRuns(board);

  if (runs.length === 0) {
    return { matchedPositions: [], groups: [], creations: [] };
  }

  // Union-find over matched cells (same catType + orthogonally adjacent).
  const cellRun = new Map<string, number[]>(); // cell -> run indices
  runs.forEach((run, idx) => {
    for (const p of run.positions) {
      const k = key(p);
      const list = cellRun.get(k) ?? [];
      list.push(idx);
      cellRun.set(k, list);
    }
  });

  // Group runs that share any cell.
  const parent: number[] = runs.map((_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a: number, b: number) => {
    parent[find(a)] = find(b);
  };
  for (const indices of cellRun.values()) {
    for (let i = 1; i < indices.length; i++) union(indices[0], indices[i]);
  }

  // Build groups keyed by root.
  const byRoot = new Map<number, Run[]>();
  runs.forEach((run, idx) => {
    const root = find(idx);
    const list = byRoot.get(root) ?? [];
    list.push(run);
    byRoot.set(root, list);
  });

  const matchedSet = new Set<string>();
  const matchedPositions: Position[] = [];
  const groups: MatchGroup[] = [];
  const creations: SpecialCreation[] = [];
  const swappedKeys = new Set(swapped.map(key));

  for (const groupRuns of byRoot.values()) {
    const cells = new Map<string, Position>();
    let hasH = false;
    let hasV = false;
    let maxRunLength = 0;
    const catType = groupRuns[0].catType;

    for (const run of groupRuns) {
      if (run.orientation === 'h') hasH = true;
      else hasV = true;
      maxRunLength = Math.max(maxRunLength, run.positions.length);
      for (const p of run.positions) cells.set(key(p), p);
    }

    const positions = [...cells.values()];
    for (const p of positions) {
      if (!matchedSet.has(key(p))) {
        matchedSet.add(key(p));
        matchedPositions.push(p);
      }
    }

    groups.push({
      catType,
      positions,
      size: positions.length,
      maxRunLength,
      hasHorizontal: hasH,
      hasVertical: hasV,
    });

    // Decide on a special creation.
    let special: SpecialCatType | null = null;
    if (hasH && hasV) special = 'angry';
    else if (maxRunLength >= 5) special = 'magician';
    else if (maxRunLength === 4) special = hasH ? 'ninjaH' : 'ninjaV';

    if (special) {
      // Prefer the cell the player swapped into; else the run intersection;
      // else the middle of the group.
      let creationPos = positions.find((p) => swappedKeys.has(key(p)));
      if (!creationPos && hasH && hasV) {
        // Intersection cell appears in 2+ runs.
        creationPos = positions.find((p) => (cellRun.get(key(p))?.length ?? 0) >= 2);
      }
      if (!creationPos) {
        creationPos = positions[Math.floor(positions.length / 2)];
      }
      creations.push({ pos: creationPos, special, catType });
    }
  }

  return { matchedPositions, groups, creations };
}

/** Whether the board currently has at least one match. */
export function hasMatches(board: Board): boolean {
  return findMatches(board).matchedPositions.length > 0;
}
