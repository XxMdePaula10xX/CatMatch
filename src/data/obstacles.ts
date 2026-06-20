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
    description: 'Obstáculo fixo (não removível no MVP).',
  },
  spine: {
    id: 'spine',
    name: 'Bloqueador de Espinha',
    emoji: '🦴',
    hp: 1,
    removable: true,
    blocksFall: true,
    description: 'Peça presa quebrada por combinações próximas.',
  },
};
