import type { LStr } from '../i18n';

export type BoosterId = 'pawBomb' | 'rainbowYarn' | 'laser' | 'giantPaw';

export interface BoosterDef {
  id: BoosterId;
  name: LStr;
  emoji: string;
  description: LStr;
  /** Implemented in the MVP (vs. visual-only). */
  implemented: boolean;
}

export const BOOSTERS: Record<BoosterId, BoosterDef> = {
  pawBomb: {
    id: 'pawBomb',
    name: { pt: 'Bomba de Patinha', en: 'Paw Bomb' },
    emoji: '🐾',
    description: { pt: 'Remove uma área 3x3.', en: 'Removes a 3x3 area.' },
    implemented: true,
  },
  rainbowYarn: {
    id: 'rainbowYarn',
    name: { pt: 'Novelo Arco-Íris', en: 'Rainbow Yarn' },
    emoji: '🌈',
    description: {
      pt: 'Remove todas as peças de um tipo.',
      en: 'Removes every tile of one type.',
    },
    implemented: false,
  },
  laser: {
    id: 'laser',
    name: { pt: 'Bigodes a Laser', en: 'Laser Whiskers' },
    emoji: '✨',
    description: {
      pt: 'Remove uma linha inteira.',
      en: 'Removes a whole row.',
    },
    implemented: true,
  },
  giantPaw: {
    id: 'giantPaw',
    name: { pt: 'Pata Gigante', en: 'Giant Paw' },
    emoji: '🖐️',
    description: {
      pt: 'Remove uma coluna inteira.',
      en: 'Removes a whole column.',
    },
    implemented: false,
  },
};

/** Boosters shown in the in-game tray. */
export const BOOSTER_ORDER: BoosterId[] = [
  'pawBomb',
  'rainbowYarn',
  'laser',
  'giantPaw',
];

/**
 * Custom SVG art for each booster (in `public/boosters/`). Rendered on the tray
 * button, falling back to the emoji above if the image ever fails to load.
 */
export const BOOSTER_IMAGE: Record<BoosterId, string> = {
  pawBomb: '/boosters/pawBomb.svg',
  rainbowYarn: '/boosters/rainbowYarn.svg',
  laser: '/boosters/laser.svg',
  giantPaw: '/boosters/giantPaw.svg',
};
