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
  name: string;
  description: string;
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
    name: 'Primeiro Miado',
    description: 'Vença a sua primeira fase.',
    icon: '🐾',
    done: (s) => s.wins >= 1,
    progress: (s) => clamp01(s.wins / 1),
  },
  {
    id: 'combo5',
    name: 'Combo Felino',
    description: 'Faça um combo x5 em cadeia.',
    icon: '🔥',
    done: (s) => s.maxCombo >= 5,
    progress: (s) => clamp01(s.maxCombo / 5),
  },
  {
    id: 'boxes100',
    name: 'Destruidor de Caixas',
    description: 'Quebre 100 caixas de papelão.',
    icon: '📦',
    done: (s) => s.boxesBroken >= 100,
    progress: (s) => clamp01(s.boxesBroken / 100),
  },
  {
    id: 'yarn25',
    name: 'Rei do Novelo',
    description: 'Ative 25 novelos de lã.',
    icon: '🧶',
    done: (s) => s.yarns >= 25,
    progress: (s) => clamp01(s.yarns / 25),
  },
  {
    id: 'boss5',
    name: 'Desperta-Chefe',
    description: 'Carregue o Gato Chefe 5 vezes.',
    icon: '👑',
    done: (s) => s.bossCharges >= 5,
    progress: (s) => clamp01(s.bossCharges / 5),
  },
  {
    id: 'speedrun',
    name: 'Gato Veloz',
    description: 'Conclua uma fase em menos de 60s.',
    icon: '⚡',
    done: (s) => s.fastWins >= 1,
    progress: (s) => clamp01(s.fastWins / 1),
  },
  {
    id: 'score10k',
    name: 'Pontuação Lendária',
    description: 'Faça 10.000 pontos numa partida.',
    icon: '⭐',
    done: (s) => s.bestScore >= 10000,
    progress: (s) => clamp01(s.bestScore / 10000),
  },
  {
    id: 'levels10',
    name: 'Pegando o Jeito',
    description: 'Conclua 10 fases.',
    icon: '🐈',
    done: (s) => s.levelsCompleted >= 10,
    progress: (s) => clamp01(s.levelsCompleted / 10),
  },
  {
    id: 'allLevels',
    name: 'Casa Cheia',
    description: 'Conclua 30 fases.',
    icon: '🏆',
    done: (s) => s.levelsCompleted >= 30,
    progress: (s) => clamp01(s.levelsCompleted / 30),
  },
  {
    id: 'adventure5',
    name: 'Explorador Felino',
    description: 'Chegue ao Andar 5 na Aventura.',
    icon: '🗺️',
    done: (s) => s.advBestDepth >= 5,
    progress: (s) => clamp01(s.advBestDepth / 5),
  },

  // ---- extra goals ----
  {
    id: 'wins10',
    name: 'Ronronando',
    description: 'Vença 10 partidas.',
    icon: '😺',
    done: (s) => s.wins >= 10,
    progress: (s) => clamp01(s.wins / 10),
  },
  {
    id: 'wins50',
    name: 'Vida de Gato',
    description: 'Vença 50 partidas.',
    icon: '😻',
    done: (s) => s.wins >= 50,
    progress: (s) => clamp01(s.wins / 50),
  },
  {
    id: 'combo8',
    name: 'Furacão Felino',
    description: 'Faça um combo x8 em cadeia.',
    icon: '🌪️',
    done: (s) => s.maxCombo >= 8,
    progress: (s) => clamp01(s.maxCombo / 8),
  },
  {
    id: 'combo10',
    name: 'Combo Lendário',
    description: 'Faça um combo x10 em cadeia.',
    icon: '💥',
    done: (s) => s.maxCombo >= 10,
    progress: (s) => clamp01(s.maxCombo / 10),
  },
  {
    id: 'boxes500',
    name: 'Triturador de Caixas',
    description: 'Quebre 500 caixas de papelão.',
    icon: '🪣',
    done: (s) => s.boxesBroken >= 500,
    progress: (s) => clamp01(s.boxesBroken / 500),
  },
  {
    id: 'yarn100',
    name: 'Fábrica de Novelos',
    description: 'Ative 100 novelos de lã.',
    icon: '🎀',
    done: (s) => s.yarns >= 100,
    progress: (s) => clamp01(s.yarns / 100),
  },
  {
    id: 'boss25',
    name: 'Domador de Chefes',
    description: 'Carregue o Gato Chefe 25 vezes.',
    icon: '🦁',
    done: (s) => s.bossCharges >= 25,
    progress: (s) => clamp01(s.bossCharges / 25),
  },
  {
    id: 'speed10',
    name: 'Pata Veloz',
    description: 'Conclua 10 fases em menos de 60s.',
    icon: '🏎️',
    done: (s) => s.fastWins >= 10,
    progress: (s) => clamp01(s.fastWins / 10),
  },
  {
    id: 'score25k',
    name: 'Mestre dos Pontos',
    description: 'Faça 25.000 pontos numa partida.',
    icon: '🌟',
    done: (s) => s.bestScore >= 25000,
    progress: (s) => clamp01(s.bestScore / 25000),
  },
  {
    id: 'score50k',
    name: 'Gato Cósmico',
    description: 'Faça 50.000 pontos numa partida.',
    icon: '🚀',
    done: (s) => s.bestScore >= 50000,
    progress: (s) => clamp01(s.bestScore / 50000),
  },
  {
    id: 'levels50',
    name: 'Colecionador de Fases',
    description: 'Conclua 50 fases.',
    icon: '🏠',
    done: (s) => s.levelsCompleted >= 50,
    progress: (s) => clamp01(s.levelsCompleted / 50),
  },
  {
    id: 'adventure10',
    name: 'Aventureiro Felino',
    description: 'Chegue ao Andar 10 na Aventura.',
    icon: '🧭',
    done: (s) => s.advBestDepth >= 10,
    progress: (s) => clamp01(s.advBestDepth / 10),
  },
  {
    id: 'adventure20',
    name: 'Lenda da Aventura',
    description: 'Chegue ao Andar 20 na Aventura.',
    icon: '🏔️',
    done: (s) => s.advBestDepth >= 20,
    progress: (s) => clamp01(s.advBestDepth / 20),
  },
];

/** Returns the ids of every achievement currently satisfied by the stats. */
export function unlockedIds(stats: Stats): string[] {
  return ACHIEVEMENTS.filter((a) => a.done(stats)).map((a) => a.id);
}
