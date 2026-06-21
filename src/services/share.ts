/** Builds a shareable text card for a Daily Challenge result (Wordle-style). */

/** 5-segment performance bar based on score thresholds. */
function ratingBar(score: number): { tier: number; bar: string } {
  // Each ~1800 pts fills a segment (tier 0..5).
  const tier = Math.max(0, Math.min(5, Math.floor(score / 1800)));
  const filled = '🟩'.repeat(tier);
  const empty = '⬜'.repeat(5 - tier);
  return { tier, bar: filled + empty };
}

export interface DailyShare {
  text: string;
  tier: number;
}

export function buildDailyShare(dayId: string, score: number): DailyShare {
  const { tier, bar } = ratingBar(score);
  const paws = '🐾'.repeat(Math.max(1, tier));
  const text =
    `🐱 Cat Match — Desafio ${dayId}\n` +
    `${bar}\n` +
    `${score.toLocaleString('pt-BR')} pontos ${paws}\n` +
    `Jogue você também! 🧶`;
  return { text, tier };
}

/**
 * Shares text via the native share sheet when available, otherwise copies to
 * the clipboard. Returns 'shared' | 'copied' | 'failed' for UI feedback.
 */
export async function shareText(
  text: string,
  title = 'Cat Match',
): Promise<'shared' | 'copied' | 'failed'> {
  try {
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string }) => Promise<void>;
    };
    if (nav.share) {
      await nav.share({ title, text });
      return 'shared';
    }
  } catch {
    // user cancelled or share failed — fall back to copy
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
