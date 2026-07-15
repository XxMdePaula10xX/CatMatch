export type BoosterId = 'pawBomb' | 'rainbowYarn' | 'laser' | 'giantPaw';

export interface BoosterDef {
  id: BoosterId;
  name: string;
  emoji: string;
  description: string;
  /** Implemented in the MVP (vs. visual-only). */
  implemented: boolean;
}

export const BOOSTERS: Record<BoosterId, BoosterDef> = {
  pawBomb: {
    id: 'pawBomb',
    name: 'Bomba de Patinha',
    emoji: '🐾',
    description: 'Remove uma área 3x3.',
    implemented: true,
  },
  rainbowYarn: {
    id: 'rainbowYarn',
    name: 'Novelo Arco-Íris',
    emoji: '🌈',
    description: 'Remove todas as peças de um tipo.',
    implemented: false,
  },
  laser: {
    id: 'laser',
    name: 'Bigodes a Laser',
    emoji: '✨',
    description: 'Remove uma linha inteira.',
    implemented: true,
  },
  giantPaw: {
    id: 'giantPaw',
    name: 'Pata Gigante',
    emoji: '🖐️',
    description: 'Remove uma coluna inteira.',
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
