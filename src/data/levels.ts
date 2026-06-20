import type { Level } from '../game/types';

/**
 * The five MVP levels described in the PRD. Difficulty ramps up by
 * introducing one new mechanic at a time.
 */
export const levels: Level[] = [
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

export function getLevel(id: number): Level | undefined {
  return levels.find((l) => l.id === id);
}

import type { CatType } from '../game/types';

/** All basic cats, used by the score-attack modes. */
export const ALL_CATS: CatType[] = [
  'orange',
  'gray',
  'white',
  'black',
  'siamese',
  'tabby',
];

export const DAILY_LEVEL_ID = 1000;
export const BLITZ_LEVEL_ID = 1001;
/** Blitz countdown length. */
export const BLITZ_DURATION_MS = 60_000;

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
