import type { CatType, SpecialCatType } from '../game/types';
import type { LStr } from '../i18n';

export interface CatDef {
  id: CatType;
  name: LStr;
  personality: LStr;
  /** Main color used for the tile gradient. */
  color: string;
  colorDark: string;
  emoji: string;
  /** Short description of the personality power. */
  power: LStr;
}

/** The six basic cats. Order is also used for level palettes. */
export const CATS: Record<CatType, CatDef> = {
  orange: {
    id: 'orange',
    name: { pt: 'Gato Laranja', en: 'Orange Cat' },
    personality: { pt: 'Alegre', en: 'Cheerful' },
    color: '#FFB36B',
    colorDark: '#F2933D',
    emoji: '🐱',
    power: {
      pt: 'Pontuação extra (+20% na combinação)',
      en: 'Extra points (+20% on the match)',
    },
  },
  gray: {
    id: 'gray',
    name: { pt: 'Gato Cinza', en: 'Gray Cat' },
    personality: { pt: 'Esperto', en: 'Clever' },
    color: '#B9C4D0',
    colorDark: '#8C9AAE',
    emoji: '😺',
    power: { pt: 'Revela uma dica de jogada', en: 'Reveals a move hint' },
  },
  white: {
    id: 'white',
    name: { pt: 'Gato Branco', en: 'White Cat' },
    personality: { pt: 'Mágico', en: 'Magical' },
    color: '#FFF4E8',
    colorDark: '#E7D8C6',
    emoji: '😸',
    power: {
      pt: 'Transforma uma peça adjacente',
      en: 'Transforms an adjacent tile',
    },
  },
  black: {
    id: 'black',
    name: { pt: 'Gato Preto', en: 'Black Cat' },
    personality: { pt: 'Sortudo', en: 'Lucky' },
    color: '#5B5566',
    colorDark: '#3C3744',
    emoji: '🐈‍⬛',
    power: {
      pt: 'Reduz a resistência de um obstáculo',
      en: "Reduces an obstacle's resistance",
    },
  },
  siamese: {
    id: 'siamese',
    name: { pt: 'Gato Siamês', en: 'Siamese Cat' },
    personality: { pt: 'Charmoso', en: 'Charming' },
    color: '#E9D6B8',
    colorDark: '#B89A6E',
    emoji: '😻',
    power: {
      pt: 'Carrega o Gato Chefe mais rápido',
      en: 'Charges the Boss Cat faster',
    },
  },
  tabby: {
    id: 'tabby',
    name: { pt: 'Gato Rajado', en: 'Tabby Cat' },
    personality: { pt: 'Bagunceiro', en: 'Messy' },
    // Vivid rose halo so it stands out from the pale white/gray/cream cats.
    color: '#FF88B8',
    colorDark: '#E0568F',
    emoji: '😽',
    power: { pt: 'Empurra uma peça próxima', en: 'Pushes a nearby tile' },
  },
};

export const CAT_TYPES: CatType[] = Object.keys(CATS) as CatType[];

export interface SpecialCatDef {
  id: SpecialCatType;
  name: LStr;
  emoji: string;
  description: LStr;
}

export const SPECIAL_CATS: Record<SpecialCatType, SpecialCatDef> = {
  ninjaH: {
    id: 'ninjaH',
    name: { pt: 'Gato Ninja', en: 'Ninja Cat' },
    emoji: '🥷',
    description: { pt: 'Limpa uma linha inteira', en: 'Clears a whole row' },
  },
  ninjaV: {
    id: 'ninjaV',
    name: { pt: 'Gato Ninja', en: 'Ninja Cat' },
    emoji: '🥷',
    description: {
      pt: 'Limpa uma coluna inteira',
      en: 'Clears a whole column',
    },
  },
  sleepy: {
    id: 'sleepy',
    name: { pt: 'Gato Soneca', en: 'Sleepy Cat' },
    emoji: '😴',
    description: {
      pt: 'Dorme 1 turno e limpa uma área 3x3',
      en: 'Sleeps 1 turn and clears a 3x3 area',
    },
  },
  magician: {
    id: 'magician',
    name: { pt: 'Gato Mágico', en: 'Magician Cat' },
    emoji: '🧙',
    description: {
      pt: 'Transforma várias peças em um tipo',
      en: 'Turns several tiles into one type',
    },
  },
  angry: {
    id: 'angry',
    name: { pt: 'Gato Bravo', en: 'Angry Cat' },
    emoji: '😾',
    description: { pt: 'Explode uma área 3x3', en: 'Blasts a 3x3 area' },
  },
  lucky: {
    id: 'lucky',
    name: { pt: 'Gato da Sorte', en: 'Lucky Cat' },
    emoji: '🍀',
    description: {
      pt: 'Remove obstáculos ou coleta itens',
      en: 'Removes obstacles or collects items',
    },
  },
};

/** How each special cat is created (shown in the in-game guide). */
export const SPECIAL_CREATE: Record<SpecialCatType, LStr> = {
  ninjaH: {
    pt: 'Combine 4 gatos iguais em linha',
    en: 'Match 4 identical cats in a row',
  },
  ninjaV: {
    pt: 'Combine 4 gatos iguais em coluna',
    en: 'Match 4 identical cats in a column',
  },
  sleepy: { pt: 'Aparece em fases avançadas', en: 'Appears in later levels' },
  magician: { pt: 'Combine 5 gatos iguais', en: 'Match 5 identical cats' },
  angry: {
    pt: 'Combine gatos em formato L ou T',
    en: 'Match cats in an L or T shape',
  },
  lucky: {
    pt: 'Recompensa de combo / fases especiais',
    en: 'Combo reward / special levels',
  },
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
