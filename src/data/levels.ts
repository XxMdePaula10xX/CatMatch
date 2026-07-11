import type { CatType, Level, Objective, ObstacleType } from '../game/types';
import { mulberry32 } from '../game/random';

/** All basic cats, in difficulty order (more types = harder to match). */
export const ALL_CATS: CatType[] = [
  'orange',
  'gray',
  'white',
  'black',
  'siamese',
  'tabby',
];

export const TOTAL_LEVELS = 110;

/**
 * The five curated tutorial levels from the PRD. Levels 6–60 are generated
 * procedurally on top of these with a rising difficulty curve.
 */
const CURATED: Level[] = [
  {
    id: 1,
    name: 'Primeiros Miados',
    moves: 20,
    objectives: [{ type: 'score', target: 500 }],
    boardConfig: {
      rows: 8,
      cols: 8,
      availableCats: ['orange', 'gray', 'white', 'black'],
    },
  },
  {
    id: 2,
    name: 'Chuva de Laranjas',
    moves: 22,
    objectives: [{ type: 'collectCat', catType: 'orange', target: 15 }],
    boardConfig: {
      rows: 8,
      cols: 8,
      availableCats: ['orange', 'gray', 'white', 'black', 'siamese'],
    },
  },
  {
    id: 3,
    name: 'Caixas Bagunceiras',
    moves: 25,
    objectives: [{ type: 'breakBox', target: 8 }],
    boardConfig: {
      rows: 8,
      cols: 8,
      availableCats: ['orange', 'gray', 'white', 'black', 'tabby'],
      obstacles: [
        { row: 2, col: 1, type: 'box' },
        { row: 2, col: 6, type: 'box' },
        { row: 3, col: 3, type: 'box' },
        { row: 3, col: 4, type: 'box' },
        { row: 5, col: 2, type: 'box' },
        { row: 5, col: 5, type: 'box' },
        { row: 6, col: 1, type: 'box' },
        { row: 6, col: 6, type: 'box' },
        { row: 4, col: 0, type: 'scratcher' },
        { row: 4, col: 7, type: 'scratcher' },
      ],
    },
  },
  {
    id: 4,
    name: 'Rolando o Novelo',
    moves: 25,
    objectives: [{ type: 'activateYarn', target: 3 }],
    boardConfig: {
      rows: 8,
      cols: 8,
      availableCats: ['orange', 'gray', 'white', 'siamese', 'tabby'],
      yarns: [
        { row: 1, col: 3 },
        { row: 4, col: 1 },
        { row: 4, col: 6 },
        { row: 6, col: 4 },
      ],
    },
  },
  {
    id: 5,
    name: 'O Gato Chefe Acorda',
    moves: 28,
    objectives: [{ type: 'chargeBoss', target: 2 }],
    boardConfig: {
      rows: 8,
      cols: 8,
      availableCats: ['orange', 'gray', 'white', 'black', 'siamese', 'tabby'],
      bossCat: true,
      obstacles: [
        { row: 0, col: 0, type: 'box' },
        { row: 0, col: 7, type: 'box' },
        { row: 7, col: 0, type: 'spine' },
        { row: 7, col: 7, type: 'spine' },
      ],
      yarns: [{ row: 3, col: 3 }],
    },
  },
];

const WORLD_NAMES = [
  'Casa Aconchegante',
  'Quintal Bagunçado',
  'Telhado dos Gatos',
  'Beco Travesso',
  'Parque Felino',
  'Castelo Real',
  'Cidade dos Gatos',
  'Floresta Ronronante',
  'Praia Felina',
  'Montanha Miau',
  'Lua dos Gatos',
];

type Archetype =
  | 'score'
  | 'collectCat'
  | 'breakBox'
  | 'activateYarn'
  | 'chargeBoss';

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
const round50 = (n: number) => Math.round(n / 50) * 50;

/** Generates a single level (id 6..60) with a difficulty-scaled objective. */
function genLevel(i: number): Level {
  const rng = mulberry32(7919 + i * 131);
  const world = Math.ceil(i / 10);
  const nCats = i <= 4 ? 4 : i <= 10 ? 5 : 6;
  const availableCats = ALL_CATS.slice(0, nCats);

  const obstacles: Array<{ row: number; col: number; type: ObstacleType }> = [];
  const yarns: Array<{ row: number; col: number }> = [];
  const occupied = new Set<string>();

  const freePos = (): { row: number; col: number } | null => {
    if (occupied.size >= 18) return null;
    for (let t = 0; t < 40; t++) {
      const row = 1 + Math.floor(rng() * 6); // rows 1..6
      const col = Math.floor(rng() * 8);
      const k = `${row},${col}`;
      if (!occupied.has(k)) {
        occupied.add(k);
        return { row, col };
      }
    }
    return null;
  };
  const placeObstacles = (type: ObstacleType, n: number): number => {
    let placed = 0;
    for (let k = 0; k < n; k++) {
      const p = freePos();
      if (!p) break;
      obstacles.push({ ...p, type });
      placed++;
    }
    return placed;
  };
  const placeYarns = (n: number): number => {
    let placed = 0;
    for (let k = 0; k < n; k++) {
      const p = freePos();
      if (!p) break;
      yarns.push(p);
      placed++;
    }
    return placed;
  };

  // Choose the primary objective; gate complex ones behind early levels.
  const isBoss = i % 10 === 0; // milestone climaxes
  const pool: Archetype[] = ['score', 'collectCat'];
  if (i >= 6) pool.push('breakBox');
  if (i >= 8) pool.push('activateYarn');
  if (i >= 10) pool.push('chargeBoss');
  const primary: Archetype = isBoss ? 'chargeBoss' : pool[i % pool.length];

  const objectives: Objective[] = [];
  let bossCat = false;
  let moveBonus = 0;

  switch (primary) {
    case 'score':
      // Cap keeps very high levels hard-but-beatable in ~18-22 moves.
      objectives.push({
        type: 'score',
        target: round50(Math.min(400 + i * 140, 12000)),
      });
      moveBonus = 2;
      break;
    case 'collectCat': {
      const cat = availableCats[i % nCats];
      objectives.push({
        type: 'collectCat',
        catType: cat,
        target: Math.min(8 + Math.floor(i / 4), 24),
      });
      break;
    }
    case 'breakBox': {
      const want = clamp(5 + Math.floor(i / 5), 5, 14);
      const placed = placeObstacles('box', want);
      objectives.push({ type: 'breakBox', target: Math.max(3, placed) });
      moveBonus = 2;
      break;
    }
    case 'activateYarn': {
      const want = clamp(3 + Math.floor(i / 14), 3, 7);
      const placed = placeYarns(want);
      objectives.push({ type: 'activateYarn', target: Math.max(2, placed) });
      moveBonus = 1;
      break;
    }
    case 'chargeBoss': {
      bossCat = true;
      objectives.push({
        type: 'chargeBoss',
        target: clamp(1 + Math.floor(i / 18), 1, 4),
      });
      moveBonus = 4;
      break;
    }
  }

  // Boss milestones add a score goal; later levels stack a secondary goal.
  if (isBoss) {
    objectives.push({
      type: 'score',
      target: round50(Math.min(1500 + i * 150, 14000)),
    });
    moveBonus += 3;
  } else if (i >= 22 && primary !== 'score') {
    objectives.push({
      type: 'score',
      target: round50(Math.min(500 + i * 120, 10000)),
    });
    moveBonus += 2;
  }

  // Extra hazards for flavour/difficulty in later worlds.
  if (i >= 14 && primary !== 'breakBox' && rng() < 0.6) {
    placeObstacles('box', clamp(2 + Math.floor(i / 12), 2, 6));
  }
  if (i >= 12 && rng() < 0.5) placeObstacles('scratcher', 2);
  if (i >= 18 && primary !== 'activateYarn' && rng() < 0.4) placeYarns(2);

  // Moves tighten as levels go up.
  let moves = clamp(30 - Math.floor((i - 1) / 6), 18, 30) + moveBonus;
  moves = clamp(moves, 18, 34);

  return {
    id: i,
    name: WORLD_NAMES[world - 1] ?? 'Aventura Felina',
    moves,
    objectives,
    boardConfig: {
      rows: 8,
      cols: 8,
      availableCats,
      ...(obstacles.length ? { obstacles } : {}),
      ...(yarns.length ? { yarns } : {}),
      ...(bossCat ? { bossCat: true } : {}),
    },
  };
}

function buildLevels(): Level[] {
  const out = [...CURATED];
  for (let i = CURATED.length + 1; i <= TOTAL_LEVELS; i++) {
    out.push(genLevel(i));
  }
  return out;
}

export const levels: Level[] = buildLevels();

export function getLevel(id: number): Level | undefined {
  return levels.find((l) => l.id === id);
}

export const DAILY_LEVEL_ID = 1000;
export const BLITZ_LEVEL_ID = 1001;
export const ADVENTURE_LEVEL_ID = 1002;
/** Blitz countdown length. */
export const BLITZ_DURATION_MS = 60_000;

const round50b = (n: number) => Math.round(n / 50) * 50;
const clampN = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

/**
 * Builds one roguelite Adventure floor. Difficulty scales with depth; relic
 * bonuses (extra moves / yarns) are applied by the store at setup time. The
 * objective is always a single score target.
 */
export function makeAdventureFloor(depth: number, extraYarns = 0): Level {
  const availableCats = depth < 3 ? ALL_CATS.slice(0, 5) : ALL_CATS;
  const target = round50b(700 + depth * 550);
  const moves = clampN(24 - Math.floor(depth / 3), 14, 24);

  const obstacles: Array<{ row: number; col: number; type: ObstacleType }> = [];
  const yarns: Array<{ row: number; col: number }> = [];
  const occupied = new Set<string>();
  const rand = Math.random;
  const freePos = () => {
    for (let t = 0; t < 40; t++) {
      const row = 1 + Math.floor(rand() * 6);
      const col = Math.floor(rand() * 8);
      const k = `${row},${col}`;
      if (!occupied.has(k)) {
        occupied.add(k);
        return { row, col };
      }
    }
    return null;
  };

  // Hazards scale with depth.
  const boxes = depth >= 4 ? clampN(Math.floor(depth / 2), 2, 8) : 0;
  for (let i = 0; i < boxes; i++) {
    const p = freePos();
    if (p) obstacles.push({ ...p, type: 'box' });
  }
  if (depth >= 6) {
    for (let i = 0; i < 2; i++) {
      const p = freePos();
      if (p) obstacles.push({ ...p, type: 'scratcher' });
    }
  }
  for (let i = 0; i < extraYarns; i++) {
    const p = freePos();
    if (p) yarns.push(p);
  }

  const bossCat = depth % 4 === 0;

  return {
    id: ADVENTURE_LEVEL_ID,
    name: `Andar ${depth}`,
    moves,
    objectives: [{ type: 'score', target }],
    boardConfig: {
      rows: 8,
      cols: 8,
      availableCats,
      ...(obstacles.length ? { obstacles } : {}),
      ...(yarns.length ? { yarns } : {}),
      ...(bossCat ? { bossCat: true } : {}),
    },
  };
}

/** Synthetic level for the Daily Challenge (seeded board, fixed moves). */
export function makeDailyLevel(dayId: string): Level {
  return {
    id: DAILY_LEVEL_ID,
    name: `Desafio ${dayId}`,
    moves: 30,
    objectives: [],
    boardConfig: { rows: 8, cols: 8, availableCats: ALL_CATS },
  };
}

/** Synthetic level for Blitz (60s, no move limit). */
export const BLITZ_LEVEL: Level = {
  id: BLITZ_LEVEL_ID,
  name: 'Relâmpago',
  moves: 9999,
  objectives: [],
  boardConfig: { rows: 8, cols: 8, availableCats: ALL_CATS },
};
