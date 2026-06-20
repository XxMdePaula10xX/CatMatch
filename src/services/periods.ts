/** Date-based identifiers for daily and weekly leaderboards / seasons. */

/** Local calendar day, e.g. "2026-06-20". */
export function getDayId(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** ISO week id, e.g. "2026-W25". The weekly leaderboard resets on this value. */
export function getWeekId(d: Date = new Date()): string {
  const date = new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
  );
  // ISO: Thursday determines the week-year.
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Friendly label for the current week (used on the leaderboard header). */
export function weekLabel(weekId: string = getWeekId()): string {
  const [, w] = weekId.split('-W');
  return `Semana ${w}`;
}
