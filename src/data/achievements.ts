import type { LStr } from '../i18n';

/** Cumulative player stats that drive achievements (persisted + cloud-synced). */
export interface Stats {
  wins: number;
  boxesBroken: number;
  yarns: number;
  bossCharges: number;
  maxCombo: number;
  bestScore: number;
  fastWins: number;
  levelsCompleted: number;
  /** Deepest Adventure floor reached. */
  advBestDepth: number;
}

export function createStats(): Stats {
  return {
    wins: 0,
    boxesBroken: 0,
    yarns: 0,
    bossCharges: 0,
    maxCombo: 0,
    bestScore: 0,
    fastWins: 0,
    levelsCompleted: 0,
    advBestDepth: 0,
  };
}

export interface AchievementDef {
  id: string;
  name: LStr;
  description: LStr;
  icon: string;
  /** Whether the stats satisfy this achievement. */
  done: (s: Stats) => boolean;
  /** Progress 0..1 for the achievements screen. */
  progress: (s: Stats) => number;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'firstWin',
    name: { pt: 'Primeiro Miado', en: 'First Meow' },
    description: { pt: 'Vença a sua primeira fase.', en: 'Win your first level.' },
    icon: '🐾',
    done: (s) => s.wins >= 1,
    progress: (s) => clamp01(s.wins / 1),
  },
  {
    id: 'combo5',
    name: { pt: 'Combo Felino', en: 'Feline Combo' },
    description: { pt: 'Faça um combo x5 em cadeia.', en: 'Chain an x5 combo.' },
    icon: '🔥',
    done: (s) => s.maxCombo >= 5,
    progress: (s) => clamp01(s.maxCombo / 5),
  },
  {
    id: 'boxes100',
    name: { pt: 'Destruidor de Caixas', en: 'Box Destroyer' },
    description: {
      pt: 'Quebre 100 caixas de papelão.',
      en: 'Break 100 cardboard boxes.',
    },
    icon: '📦',
    done: (s) => s.boxesBroken >= 100,
    progress: (s) => clamp01(s.boxesBroken / 100),
  },
  {
    id: 'yarn25',
    name: { pt: 'Rei do Novelo', en: 'Yarn King' },
    description: { pt: 'Ative 25 novelos de lã.', en: 'Activate 25 balls of yarn.' },
    icon: '🧶',
    done: (s) => s.yarns >= 25,
    progress: (s) => clamp01(s.yarns / 25),
  },
  {
    id: 'boss5',
    name: { pt: 'Desperta-Chefe', en: 'Boss Waker' },
    description: {
      pt: 'Carregue o Gato Chefe 5 vezes.',
      en: 'Charge the Boss Cat 5 times.',
    },
    icon: '👑',
    done: (s) => s.bossCharges >= 5,
    progress: (s) => clamp01(s.bossCharges / 5),
  },
  {
    id: 'speedrun',
    name: { pt: 'Gato Veloz', en: 'Speedy Cat' },
    description: {
      pt: 'Conclua uma fase em menos de 60s.',
      en: 'Finish a level in under 60s.',
    },
    icon: '⚡',
    done: (s) => s.fastWins >= 1,
    progress: (s) => clamp01(s.fastWins / 1),
  },
  {
    id: 'score10k',
    name: { pt: 'Pontuação Lendária', en: 'Legendary Score' },
    description: {
      pt: 'Faça 10.000 pontos numa partida.',
      en: 'Score 10,000 points in one game.',
    },
    icon: '⭐',
    done: (s) => s.bestScore >= 10000,
    progress: (s) => clamp01(s.bestScore / 10000),
  },
  {
    id: 'levels10',
    name: { pt: 'Pegando o Jeito', en: 'Getting the Hang of It' },
    description: { pt: 'Conclua 10 fases.', en: 'Complete 10 levels.' },
    icon: '🐈',
    done: (s) => s.levelsCompleted >= 10,
    progress: (s) => clamp01(s.levelsCompleted / 10),
  },
  {
    id: 'allLevels',
    name: { pt: 'Casa Cheia', en: 'Full House' },
    description: { pt: 'Conclua 30 fases.', en: 'Complete 30 levels.' },
    icon: '🏆',
    done: (s) => s.levelsCompleted >= 30,
    progress: (s) => clamp01(s.levelsCompleted / 30),
  },
  {
    id: 'adventure5',
    name: { pt: 'Explorador Felino', en: 'Feline Explorer' },
    description: {
      pt: 'Chegue ao Andar 5 na Aventura.',
      en: 'Reach Floor 5 in Adventure.',
    },
    icon: '🗺️',
    done: (s) => s.advBestDepth >= 5,
    progress: (s) => clamp01(s.advBestDepth / 5),
  },

  // ---- extra goals ----
  {
    id: 'wins10',
    name: { pt: 'Ronronando', en: 'Purring Along' },
    description: { pt: 'Vença 10 partidas.', en: 'Win 10 games.' },
    icon: '😺',
    done: (s) => s.wins >= 10,
    progress: (s) => clamp01(s.wins / 10),
  },
  {
    id: 'wins50',
    name: { pt: 'Vida de Gato', en: "Cat's Life" },
    description: { pt: 'Vença 50 partidas.', en: 'Win 50 games.' },
    icon: '😻',
    done: (s) => s.wins >= 50,
    progress: (s) => clamp01(s.wins / 50),
  },
  {
    id: 'combo8',
    name: { pt: 'Furacão Felino', en: 'Feline Hurricane' },
    description: { pt: 'Faça um combo x8 em cadeia.', en: 'Chain an x8 combo.' },
    icon: '🌪️',
    done: (s) => s.maxCombo >= 8,
    progress: (s) => clamp01(s.maxCombo / 8),
  },
  {
    id: 'combo10',
    name: { pt: 'Combo Lendário', en: 'Legendary Combo' },
    description: { pt: 'Faça um combo x10 em cadeia.', en: 'Chain an x10 combo.' },
    icon: '💥',
    done: (s) => s.maxCombo >= 10,
    progress: (s) => clamp01(s.maxCombo / 10),
  },
  {
    id: 'boxes500',
    name: { pt: 'Triturador de Caixas', en: 'Box Shredder' },
    description: {
      pt: 'Quebre 500 caixas de papelão.',
      en: 'Break 500 cardboard boxes.',
    },
    icon: '🪣',
    done: (s) => s.boxesBroken >= 500,
    progress: (s) => clamp01(s.boxesBroken / 500),
  },
  {
    id: 'yarn100',
    name: { pt: 'Fábrica de Novelos', en: 'Yarn Factory' },
    description: {
      pt: 'Ative 100 novelos de lã.',
      en: 'Activate 100 balls of yarn.',
    },
    icon: '🎀',
    done: (s) => s.yarns >= 100,
    progress: (s) => clamp01(s.yarns / 100),
  },
  {
    id: 'boss25',
    name: { pt: 'Domador de Chefes', en: 'Boss Tamer' },
    description: {
      pt: 'Carregue o Gato Chefe 25 vezes.',
      en: 'Charge the Boss Cat 25 times.',
    },
    icon: '🦁',
    done: (s) => s.bossCharges >= 25,
    progress: (s) => clamp01(s.bossCharges / 25),
  },
  {
    id: 'speed10',
    name: { pt: 'Pata Veloz', en: 'Swift Paw' },
    description: {
      pt: 'Conclua 10 fases em menos de 60s.',
      en: 'Finish 10 levels in under 60s.',
    },
    icon: '🏎️',
    done: (s) => s.fastWins >= 10,
    progress: (s) => clamp01(s.fastWins / 10),
  },
  {
    id: 'score25k',
    name: { pt: 'Mestre dos Pontos', en: 'Score Master' },
    description: {
      pt: 'Faça 25.000 pontos numa partida.',
      en: 'Score 25,000 points in one game.',
    },
    icon: '🌟',
    done: (s) => s.bestScore >= 25000,
    progress: (s) => clamp01(s.bestScore / 25000),
  },
  {
    id: 'score50k',
    name: { pt: 'Gato Cósmico', en: 'Cosmic Cat' },
    description: {
      pt: 'Faça 50.000 pontos numa partida.',
      en: 'Score 50,000 points in one game.',
    },
    icon: '🚀',
    done: (s) => s.bestScore >= 50000,
    progress: (s) => clamp01(s.bestScore / 50000),
  },
  {
    id: 'levels50',
    name: { pt: 'Colecionador de Fases', en: 'Level Collector' },
    description: { pt: 'Conclua 50 fases.', en: 'Complete 50 levels.' },
    icon: '🏠',
    done: (s) => s.levelsCompleted >= 50,
    progress: (s) => clamp01(s.levelsCompleted / 50),
  },
  {
    id: 'adventure10',
    name: { pt: 'Aventureiro Felino', en: 'Feline Adventurer' },
    description: {
      pt: 'Chegue ao Andar 10 na Aventura.',
      en: 'Reach Floor 10 in Adventure.',
    },
    icon: '🧭',
    done: (s) => s.advBestDepth >= 10,
    progress: (s) => clamp01(s.advBestDepth / 10),
  },
  {
    id: 'adventure20',
    name: { pt: 'Lenda da Aventura', en: 'Adventure Legend' },
    description: {
      pt: 'Chegue ao Andar 20 na Aventura.',
      en: 'Reach Floor 20 in Adventure.',
    },
    icon: '🏔️',
    done: (s) => s.advBestDepth >= 20,
    progress: (s) => clamp01(s.advBestDepth / 20),
  },
];

/** Returns the ids of every achievement currently satisfied by the stats. */
export function unlockedIds(stats: Stats): string[] {
  return ACHIEVEMENTS.filter((a) => a.done(stats)).map((a) => a.id);
}
