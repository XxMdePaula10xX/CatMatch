import type { CatType, SpecialCatType } from '../game/types';

export interface CatDef {
  id: CatType;
  name: string;
  personality: string;
  /** Main color used for the tile gradient. */
  color: string;
  colorDark: string;
  emoji: string;
  /** Short description of the personality power. */
  power: string;
}

/** The six basic cats. Order is also used for level palettes. */
export const CATS: Record<CatType, CatDef> = {
  orange: {
    id: 'orange',
    name: 'Gato Laranja',
    personality: 'Alegre',
    color: '#FFB36B',
    colorDark: '#F2933D',
    emoji: '🐱',
    power: 'Pontuação extra (+20% na combinação)',
  },
  gray: {
    id: 'gray',
    name: 'Gato Cinza',
    personality: 'Esperto',
    color: '#B9C4D0',
    colorDark: '#8C9AAE',
    emoji: '😺',
    power: 'Revela uma dica de jogada',
  },
  white: {
    id: 'white',
    name: 'Gato Branco',
    personality: 'Mágico',
    color: '#FFF4E8',
    colorDark: '#E7D8C6',
    emoji: '😸',
    power: 'Transforma uma peça adjacente',
  },
  black: {
    id: 'black',
    name: 'Gato Preto',
    personality: 'Sortudo',
    color: '#5B5566',
    colorDark: '#3C3744',
    emoji: '🐈‍⬛',
    power: 'Reduz a resistência de um obstáculo',
  },
  siamese: {
    id: 'siamese',
    name: 'Gato Siamês',
    personality: 'Charmoso',
    color: '#E9D6B8',
    colorDark: '#B89A6E',
    emoji: '😻',
    power: 'Carrega o Gato Chefe mais rápido',
  },
  tabby: {
    id: 'tabby',
    name: 'Gato Rajado',
    personality: 'Bagunceiro',
    color: '#A8B0BC',
    colorDark: '#727B8A',
    emoji: '😽',
    power: 'Empurra uma peça próxima',
  },
};

export const CAT_TYPES: CatType[] = Object.keys(CATS) as CatType[];

export interface SpecialCatDef {
  id: SpecialCatType;
  name: string;
  emoji: string;
  description: string;
}

export const SPECIAL_CATS: Record<SpecialCatType, SpecialCatDef> = {
  ninjaH: {
    id: 'ninjaH',
    name: 'Ninja Cat',
    emoji: '🥷',
    description: 'Limpa uma linha inteira',
  },
  ninjaV: {
    id: 'ninjaV',
    name: 'Ninja Cat',
    emoji: '🥷',
    description: 'Limpa uma coluna inteira',
  },
  sleepy: {
    id: 'sleepy',
    name: 'Sleepy Cat',
    emoji: '😴',
    description: 'Dorme 1 turno e limpa uma área 3x3',
  },
  magician: {
    id: 'magician',
    name: 'Magician Cat',
    emoji: '🧙',
    description: 'Transforma várias peças em um tipo',
  },
  angry: {
    id: 'angry',
    name: 'Angry Cat',
    emoji: '😾',
    description: 'Explode uma área 3x3',
  },
  lucky: {
    id: 'lucky',
    name: 'Lucky Black Cat',
    emoji: '🍀',
    description: 'Remove obstáculos ou coleta itens',
  },
};

/** How each special cat is created (shown in the in-game guide). */
export const SPECIAL_CREATE: Record<SpecialCatType, string> = {
  ninjaH: 'Combine 4 gatos iguais em linha',
  ninjaV: 'Combine 4 gatos iguais em coluna',
  sleepy: 'Aparece em fases avançadas',
  magician: 'Combine 5 gatos iguais',
  angry: 'Combine gatos em formato L ou T',
  lucky: 'Recompensa de combo / fases especiais',
};

/**
 * Image sources for the cat art. Drop final PNGs into `public/cats/` using
 * these exact filenames and they replace the emoji automatically.
 * See `public/cats/README.md`.
 */
export const CAT_IMAGE: Record<CatType, string> = {
  orange: '/cats/orange.png',
  gray: '/cats/gray.png',
  white: '/cats/white.png',
  black: '/cats/black.png',
  siamese: '/cats/siamese.png',
  tabby: '/cats/tabby.png',
};

export const SPECIAL_IMAGE: Record<SpecialCatType, string> = {
  ninjaH: '/cats/ninja.png',
  ninjaV: '/cats/ninja.png',
  sleepy: '/cats/sleepy.png',
  magician: '/cats/magician.png',
  angry: '/cats/angry.png',
  lucky: '/cats/lucky.png',
};

/** Temporary emoji placeholders, mirroring the PRD list. */
export const CAT_PLACEHOLDERS = {
  orange: '🐱',
  gray: '😺',
  white: '😸',
  black: '🐈‍⬛',
  siamese: '😻',
  tabby: '😽',
  ninja: '🥷',
  sleepy: '😴',
  magician: '🧙',
  angry: '😾',
  lucky: '🍀',
} as const;
