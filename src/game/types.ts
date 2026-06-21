// Core domain types for Cat Match.

/** The six basic cat types available in the MVP. */
export type CatType =
  | 'orange'
  | 'gray'
  | 'white'
  | 'black'
  | 'siamese'
  | 'tabby';

/** Special cats created by larger / shaped matches or spawned in levels. */
export type SpecialCatType =
  | 'ninjaH' // clears a row
  | 'ninjaV' // clears a column
  | 'sleepy' // delayed 3x3 clear
  | 'magician' // transforms random tiles to one type
  | 'angry' // explodes a 3x3 area
  | 'lucky'; // removes obstacles / collects objectives

/** Obstacles that block the board. */
export type ObstacleType =
  | 'box' // Caixa de Papelão — hp 2
  | 'scratcher' // Arranhador — hp 1, blocks falling
  | 'bed' // Caminha — not removable in MVP
  | 'spine'; // Bloqueador de Espinha — hp 1

export type TileType = 'cat' | 'specialCat' | 'yarn' | 'obstacle' | 'empty';

export interface Tile {
  id: string;
  row: number;
  col: number;
  type: TileType;
  catType?: CatType;
  specialType?: SpecialCatType;
  obstacleType?: ObstacleType;
  /** Remaining hit points for obstacles (and sleepy countdown). */
  hp?: number;
  isMatched?: boolean;
  isFalling?: boolean;
  isAnimating?: boolean;
  /** Marks tiles freshly created this resolution (for spawn animation). */
  isNew?: boolean;
  /** Power activation highlight flag for visual feedback. */
  isActivating?: boolean;
}

export type Board = Tile[][];

export type Position = { row: number; col: number };

// ---- Levels / objectives ----

export type ObjectiveType =
  | 'score'
  | 'collectCat'
  | 'breakBox'
  | 'activateYarn'
  | 'chargeBoss';

export interface Objective {
  type: ObjectiveType;
  target: number;
  /** For collectCat objectives, which cat to collect. */
  catType?: CatType;
  /** Runtime progress (filled in by the store). */
  current?: number;
}

export interface BoardConfig {
  rows: number;
  cols: number;
  availableCats: CatType[];
  /** Optional obstacle placements: [row, col, type]. */
  obstacles?: Array<{ row: number; col: number; type: ObstacleType }>;
  /** Optional yarn ball placements. */
  yarns?: Array<{ row: number; col: number }>;
  /** Whether the Boss Cat mechanic is active for this level. */
  bossCat?: boolean;
}

export interface Level {
  id: number;
  name: string;
  moves: number;
  objectives: Objective[];
  boardConfig: BoardConfig;
}

// ---- Game flow ----

export type Screen =
  | 'home'
  | 'levelSelect'
  | 'game'
  | 'leaderboard'
  | 'achievements'
  | 'relicSelect';

export type GameStatus = 'playing' | 'won' | 'lost' | 'finished';

/** Play modes. `normal` is the level campaign; `daily`/`blitz` are score-attack;
 *  `adventure` is the roguelite run with relics. */
export type GameMode = 'normal' | 'daily' | 'blitz' | 'adventure';

export type BossState =
  | 'sleeping'
  | 'waking'
  | 'excited'
  | 'power'
  | 'backToSleep';

export interface FloatingScore {
  id: string;
  row: number;
  col: number;
  value: number;
}
