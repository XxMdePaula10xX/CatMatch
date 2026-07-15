import type { CatType } from '../game/types';
import type { LStr } from '../i18n';

/** Aggregated, numeric effects applied by the relics a player has collected. */
export interface RelicEffects {
  /** Extra moves granted at the start of each floor. */
  extraMoves: number;
  /** Multiplicative score factor (default 1). */
  scoreMult: number;
  /** Extra fractional score per matched group of a given cat (e.g. 1 = +100%). */
  catBonus: Partial<Record<CatType, number>>;
  /** Extra of each implemented booster granted per floor. */
  bonusBoosters: number;
  /** Yarn balls spawned on the board each floor. */
  yarnsPerFloor: number;
  /** Offsets the cascade multiplier tier (combos count one level higher). */
  comboTierBonus: number;
  /** First N moves of each floor don't consume a move. */
  freeMoves: number;
}

export function emptyEffects(): RelicEffects {
  return {
    extraMoves: 0,
    scoreMult: 1,
    catBonus: {},
    bonusBoosters: 0,
    yarnsPerFloor: 0,
    comboTierBonus: 0,
    freeMoves: 0,
  };
}

export interface RelicDef {
  id: string;
  name: LStr;
  icon: string;
  description: LStr;
  apply: (e: RelicEffects) => void;
}

export const RELICS: RelicDef[] = [
  {
    id: 'patasExtras',
    name: { pt: 'Patas Extras', en: 'Extra Paws' },
    icon: '🐾',
    description: {
      pt: '+3 movimentos em cada andar.',
      en: '+3 moves on every floor.',
    },
    apply: (e) => {
      e.extraMoves += 3;
    },
  },
  {
    id: 'ronronarDourado',
    name: { pt: 'Ronronar Dourado', en: 'Golden Purr' },
    icon: '✨',
    description: {
      pt: '+25% de pontos em tudo.',
      en: '+25% points on everything.',
    },
    apply: (e) => {
      e.scoreMult *= 1.25;
    },
  },
  {
    id: 'festaLaranja',
    name: { pt: 'Festa Laranja', en: 'Orange Party' },
    icon: '🐱',
    description: {
      pt: 'Gatos laranja valem o dobro.',
      en: 'Orange cats are worth double.',
    },
    apply: (e) => {
      e.catBonus.orange = (e.catBonus.orange ?? 0) + 1;
    },
  },
  {
    id: 'kitPatinha',
    name: { pt: 'Kit de Patinha', en: 'Paw Kit' },
    icon: '🧰',
    description: {
      pt: '+1 de cada booster por andar.',
      en: '+1 of each booster per floor.',
    },
    apply: (e) => {
      e.bonusBoosters += 1;
    },
  },
  {
    id: 'chuvaNovelos',
    name: { pt: 'Chuva de Novelos', en: 'Yarn Rain' },
    icon: '🧶',
    description: {
      pt: '2 novelos extras a cada andar.',
      en: '2 extra yarns on every floor.',
    },
    apply: (e) => {
      e.yarnsPerFloor += 2;
    },
  },
  {
    id: 'comboFelino',
    name: { pt: 'Combo Felino', en: 'Feline Combo' },
    icon: '🔥',
    description: {
      pt: 'Combos contam um nível acima.',
      en: 'Combos count one tier higher.',
    },
    apply: (e) => {
      e.comboTierBonus += 1;
    },
  },
  {
    id: 'sonecaEsperta',
    name: { pt: 'Soneca Esperta', en: 'Clever Nap' },
    icon: '😴',
    description: {
      pt: 'As 2 primeiras jogadas do andar são grátis.',
      en: 'The first 2 moves of the floor are free.',
    },
    apply: (e) => {
      e.freeMoves += 2;
    },
  },
  {
    id: 'bigodesAfiados',
    name: { pt: 'Bigodes Afiados', en: 'Sharp Whiskers' },
    icon: '⚡',
    description: {
      pt: '+15% de pontos e +1 movimento.',
      en: '+15% points and +1 move.',
    },
    apply: (e) => {
      e.scoreMult *= 1.15;
      e.extraMoves += 1;
    },
  },
];

export function getRelic(id: string): RelicDef | undefined {
  return RELICS.find((r) => r.id === id);
}

/** Folds a list of collected relic ids into a single effects object. */
export function aggregateRelics(ids: string[]): RelicEffects {
  const e = emptyEffects();
  for (const id of ids) getRelic(id)?.apply(e);
  return e;
}

/** Picks `n` distinct random relics to offer between floors. */
export function offerRelics(n = 3, rand: () => number = Math.random): string[] {
  const pool = RELICS.map((r) => r.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}
