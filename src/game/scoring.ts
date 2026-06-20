/** Centralised scoring + energy constants and helpers. */

export const SCORE = {
  match3: 100,
  match4: 250,
  match5: 500,
  obstacleDestroyed: 150,
  yarnActivated: 300,
  bossPower: 500,
} as const;

export const BOSS_ENERGY = {
  match3: 5,
  match4: 10,
  match5: 20,
  cascadeBonus: 5,
  siameseBonus: 5,
  full: 100,
} as const;

/** Base points for a match of the given group size. */
export function baseScoreForSize(size: number): number {
  if (size >= 5) return SCORE.match5;
  if (size === 4) return SCORE.match4;
  return SCORE.match3;
}

/** Boss energy contribution for a match of the given group size. */
export function bossEnergyForSize(size: number): number {
  if (size >= 5) return BOSS_ENERGY.match5;
  if (size === 4) return BOSS_ENERGY.match4;
  return BOSS_ENERGY.match3;
}

/**
 * Cascade multiplier: 1st combo x1, 2nd x1.5, 3rd x2, 4th+ x3.
 * `cascadeLevel` is 1-based.
 */
export function comboMultiplier(cascadeLevel: number): number {
  if (cascadeLevel <= 1) return 1;
  if (cascadeLevel === 2) return 1.5;
  if (cascadeLevel === 3) return 2;
  return 3;
}

/**
 * High-score time bonus: the faster the level is cleared, the bigger the
 * multiplier applied to the final score.
 */
export function timeMultiplier(elapsedMs: number): number {
  const s = elapsedMs / 1000;
  if (s <= 60) return 3;
  if (s <= 120) return 2;
  if (s <= 180) return 1.5;
  return 1;
}
