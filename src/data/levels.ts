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
