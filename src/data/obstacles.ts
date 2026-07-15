import type { ObstacleType } from '../game/types';

export interface ObstacleDef {
  id: ObstacleType;
  name: string;
  emoji: string;
  hp: number;
  removable: boolean;
  /** Whether the obstacle blocks tiles from falling through its column. */
  blocksFall: boolean;
  description: string;
}

export const OBSTACLES: Record<ObstacleType, ObstacleDef> = {
  box: {
    id: 'box',
    name: 'Caixa de Papelão',
    emoji: '📦',
    hp: 2,
    removable: true,
    blocksFall: true,
    description: 'Precisa receber dano duas vezes para sumir.',
  },
  scratcher: {
    id: 'scratcher',
    name: 'Arranhador',
    emoji: '🪵',
    hp: 1,
    removable: true,
    blocksFall: true,
    description: 'Bloqueia a queda de peças na coluna.',
  },
  bed: {
    id: 'bed',
    name: 'Caminha',
    emoji: '🛏️',
    hp: 99,
    removable: false,
    blocksFall: true,
    description: 'Obstáculo fixo que não pode ser removido.',
  },
  spine: {
    id: 'spine',
    name: 'Barreira de Osso',
    emoji: '🦴',
    hp: 1,
    removable: true,
    blocksFall: true,
    description: 'Quebra com combinações ao lado dela.',
  },
};

/**
 * Custom SVG art for each obstacle (in `public/obstacles/`). Rendered as the
 * tile visual, falling back to the emoji above if the image ever fails to load.
 */
export const OBSTACLE_IMAGE: Record<ObstacleType, string> = {
  box: '/obstacles/box.svg',
  scratcher: '/obstacles/scratcher.svg',
  bed: '/obstacles/bed.svg',
  spine: '/obstacles/spine.svg',
};
