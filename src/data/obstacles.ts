import type { ObstacleType } from '../game/types';
import type { LStr } from '../i18n';

export interface ObstacleDef {
  id: ObstacleType;
  name: LStr;
  emoji: string;
  hp: number;
  removable: boolean;
  /** Whether the obstacle blocks tiles from falling through its column. */
  blocksFall: boolean;
  description: LStr;
}

export const OBSTACLES: Record<ObstacleType, ObstacleDef> = {
  box: {
    id: 'box',
    name: { pt: 'Caixa de Papelão', en: 'Cardboard Box' },
    emoji: '📦',
    hp: 2,
    removable: true,
    blocksFall: true,
    description: {
      pt: 'Precisa receber dano duas vezes para sumir.',
      en: 'Needs to be hit twice to disappear.',
    },
  },
  scratcher: {
    id: 'scratcher',
    name: { pt: 'Arranhador', en: 'Scratcher' },
    emoji: '🪵',
    hp: 1,
    removable: true,
    blocksFall: true,
    description: {
      pt: 'Bloqueia a queda de peças na coluna.',
      en: 'Blocks tiles from falling in its column.',
    },
  },
  bed: {
    id: 'bed',
    name: { pt: 'Caminha', en: 'Cat Bed' },
    emoji: '🛏️',
    hp: 99,
    removable: false,
    blocksFall: true,
    description: {
      pt: 'Obstáculo fixo que não pode ser removido.',
      en: "A fixed obstacle that can't be removed.",
    },
  },
  spine: {
    id: 'spine',
    name: { pt: 'Barreira de Osso', en: 'Bone Barrier' },
    emoji: '🦴',
    hp: 1,
    removable: true,
    blocksFall: true,
    description: {
      pt: 'Quebra com combinações ao lado dela.',
      en: 'Breaks with matches made next to it.',
    },
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
