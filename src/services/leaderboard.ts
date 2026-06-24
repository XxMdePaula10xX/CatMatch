import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getDb, firebaseEnabled } from './firebase';
import { getDayId, getWeekId } from './periods';

export type Scope = 'weekly' | 'daily';

export interface LeaderEntry {
  name: string;
  score: number;
  /** Which board: 'lvl1'..'lvl5', 'daily', or 'blitz'. */
  board: string;
  /** Period bucket: a week id (weekly) or day id (daily). */
  periodId: string;
  scope: Scope;
  uid?: string;
  /** ISO 3166 country code (e.g. "BR"), from the device locale. */
  country?: string;
  createdAt?: number;
}

export interface SubmitParams {
  uid?: string;
  name: string;
  score: number;
  board: string;
  scope: Scope;
}

export interface QueryParams {
  /** Omit for the "Geral" view (all weekly boards). */
  board?: string;
  scope: Scope;
}

const LOCAL_KEY = 'catmatch.leaderboard';
const COLLECTION = 'scores';

function periodFor(scope: Scope): string {
  return scope === 'daily' ? getDayId() : getWeekId();
}

/**
 * Maps IANA time zones to ISO country codes. The time zone reflects where the
 * device actually is, unlike the language (a phone set to English in Brazil
 * would otherwise report GB/US). Covers the common zones; unknown ones fall
 * back to the locale region.
 */
const TZ_COUNTRY: Record<string, string> = {
  // Brazil
  'America/Sao_Paulo': 'BR', 'America/Bahia': 'BR', 'America/Fortaleza': 'BR',
  'America/Recife': 'BR', 'America/Manaus': 'BR', 'America/Belem': 'BR',
  'America/Cuiaba': 'BR', 'America/Campo_Grande': 'BR', 'America/Boa_Vista': 'BR',
  'America/Porto_Velho': 'BR', 'America/Rio_Branco': 'BR', 'America/Noronha': 'BR',
  'America/Maceio': 'BR', 'America/Araguaina': 'BR', 'America/Santarem': 'BR',
  'America/Eirunepe': 'BR',
  // Portugal
  'Europe/Lisbon': 'PT', 'Atlantic/Azores': 'PT', 'Atlantic/Madeira': 'PT',
  // USA
  'America/New_York': 'US', 'America/Detroit': 'US', 'America/Chicago': 'US',
  'America/Denver': 'US', 'America/Phoenix': 'US', 'America/Los_Angeles': 'US',
  'America/Anchorage': 'US', 'Pacific/Honolulu': 'US', 'America/Boise': 'US',
  'America/Indiana/Indianapolis': 'US',
  // Canada
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/St_Johns': 'CA',
  'America/Regina': 'CA',
  // Mexico & Central America
  'America/Mexico_City': 'MX', 'America/Monterrey': 'MX', 'America/Cancun': 'MX',
  'America/Tijuana': 'MX', 'America/Merida': 'MX', 'America/Chihuahua': 'MX',
  'America/Guatemala': 'GT', 'America/Tegucigalpa': 'HN', 'America/Managua': 'NI',
  'America/Costa_Rica': 'CR', 'America/Panama': 'PA', 'America/El_Salvador': 'SV',
  'America/Belize': 'BZ',
  // South America
  'America/Argentina/Buenos_Aires': 'AR', 'America/Argentina/Cordoba': 'AR',
  'America/Argentina/Mendoza': 'AR', 'America/Argentina/Salta': 'AR',
  'America/Argentina/Tucuman': 'AR', 'America/Santiago': 'CL',
  'America/Punta_Arenas': 'CL', 'America/Bogota': 'CO', 'America/Lima': 'PE',
  'America/La_Paz': 'BO', 'America/Caracas': 'VE', 'America/Montevideo': 'UY',
  'America/Asuncion': 'PY', 'America/Guayaquil': 'EC', 'America/Cayenne': 'GF',
  'America/Paramaribo': 'SR', 'America/Guyana': 'GY',
  // Caribbean
  'America/Havana': 'CU', 'America/Santo_Domingo': 'DO',
  'America/Puerto_Rico': 'PR', 'America/Jamaica': 'JM',
  'America/Port-au-Prince': 'HT', 'America/Nassau': 'BS',
  'America/Barbados': 'BB', 'America/Port_of_Spain': 'TT',
  // Europe
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH', 'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ',
  'Europe/Budapest': 'HU', 'Europe/Bucharest': 'RO', 'Europe/Athens': 'GR',
  'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI', 'Europe/Moscow': 'RU', 'Europe/Kiev': 'UA',
  'Europe/Kyiv': 'UA', 'Europe/Istanbul': 'TR',
  // Africa
  'Africa/Lagos': 'NG', 'Africa/Cairo': 'EG', 'Africa/Johannesburg': 'ZA',
  'Africa/Nairobi': 'KE', 'Africa/Casablanca': 'MA', 'Africa/Accra': 'GH',
  'Africa/Algiers': 'DZ', 'Africa/Tunis': 'TN', 'Africa/Luanda': 'AO',
  'Africa/Maputo': 'MZ',
  // Asia / Middle East
  'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN', 'Asia/Hong_Kong': 'HK',
  'Asia/Seoul': 'KR', 'Asia/Singapore': 'SG', 'Asia/Bangkok': 'TH',
  'Asia/Jakarta': 'ID', 'Asia/Manila': 'PH', 'Asia/Kolkata': 'IN',
  'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA', 'Asia/Tehran': 'IR', 'Asia/Jerusalem': 'IL',
  'Asia/Ho_Chi_Minh': 'VN', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Taipei': 'TW',
  // Oceania
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU', 'Pacific/Auckland': 'NZ',
};

/**
 * Best-effort ISO country code, primarily from the device time zone (reflects
 * actual location, not the phone language), falling back to the locale region.
 * No GPS, privacy-safe.
 */
export function getCountryCode(): string | undefined {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TZ_COUNTRY[tz]) return TZ_COUNTRY[tz];
  } catch {
    /* ignore */
  }
  try {
    const loc = navigator.languages?.[0] || navigator.language || '';
    if (!loc) return undefined;
    const region = new Intl.Locale(loc).maximize().region;
    return region || undefined;
  } catch {
    return undefined;
  }
}

/** Turns a 2-letter country code into its flag emoji ("BR" -> 🇧🇷). */
export function countryFlag(code?: string): string {
  if (!code || code.length !== 2) return '';
  const A = 0x1f1e6;
  const cc = code.toUpperCase();
  return String.fromCodePoint(
    A + cc.charCodeAt(0) - 65,
    A + cc.charCodeAt(1) - 65,
  );
}

/** Rejects after `ms` so a hung network request never freezes the UI. */
function withTimeout<T>(p: Promise<T>, ms = 10000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms),
    ),
  ]);
}

/** Seeds so the weekly board isn't empty on first run (local mode only). */
function seed(): LeaderEntry[] {
  const week = getWeekId();
  const mk = (
    name: string,
    score: number,
    board: string,
  ): LeaderEntry => ({ name, score, board, periodId: week, scope: 'weekly' });
  return [
    mk('Mimi 🐱', 12800, 'lvl5'),
    mk('Felix 😼', 9400, 'lvl4'),
    mk('Luna 😻', 7200, 'lvl3'),
    mk('Tom 😺', 4100, 'lvl2'),
    mk('Bigode 😸', 2500, 'lvl1'),
    mk('Pretinha 🐈‍⬛', 6300, 'blitz'),
  ];
}

function readLocal(): LeaderEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw) as LeaderEntry[];
  } catch {
    /* ignore */
  }
  return seed();
}

function writeLocal(entries: LeaderEntry[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

/** Submits a score, keeping a single best document per (user, board, period). */
export async function submitScore(params: SubmitParams): Promise<void> {
  const periodId = periodFor(params.scope);
  const entry: LeaderEntry = {
    name: params.name,
    score: params.score,
    board: params.board,
    periodId,
    scope: params.scope,
    uid: params.uid,
    country: getCountryCode(),
  };

  if (firebaseEnabled && entry.uid) {
    const db = getDb();
    if (db) {
      try {
        const ref = doc(
          db,
          COLLECTION,
          `${entry.uid}_${entry.board}_${periodId}`,
        );
        const snap = await getDoc(ref);
        const prev = snap.exists() ? (snap.data().score as number) : 0;
        if (entry.score > prev) {
          await setDoc(ref, { ...entry, updatedAt: serverTimestamp() });
        }
      } catch (e) {
        console.warn('submitScore falhou', e);
      }
      return;
    }
  }

  // Local fallback: best per (name, board, period).
  const entries = readLocal();
  const idx = entries.findIndex(
    (e) =>
      e.name === entry.name &&
      e.board === entry.board &&
      e.periodId === periodId,
  );
  if (idx >= 0) {
    if (entry.score > entries[idx].score) entries[idx] = { ...entry };
  } else {
    entries.push({ ...entry, createdAt: Date.now() });
  }
  writeLocal(entries);
}

function dedupeByUser(entries: LeaderEntry[]): LeaderEntry[] {
  const best = new Map<string, LeaderEntry>();
  for (const e of entries) {
    const key = e.uid ?? e.name;
    const cur = best.get(key);
    if (!cur || e.score > cur.score) best.set(key, e);
  }
  return [...best.values()];
}

/** Top scores for the current period of the given board (or all weekly boards). */
export async function getTopScores(
  params: QueryParams,
  max = 25,
): Promise<LeaderEntry[]> {
  const periodId = periodFor(params.scope);

  if (firebaseEnabled) {
    const db = getDb();
    if (db) {
      try {
        // Single equality filter (no orderBy) so Firestore serves it from the
        // automatic single-field index — no composite index to create. We
        // filter the board and sort by score on the client.
        const base = collection(db, COLLECTION);
        const q = query(base, where('periodId', '==', periodId));
        const snap = await withTimeout(getDocs(q));
        let rows = snap.docs.map((d) => d.data() as LeaderEntry);
        if (params.board) {
          rows = rows.filter((e) => e.board === params.board);
        } else {
          rows = dedupeByUser(rows.filter((e) => e.scope === 'weekly'));
        }
        return rows.sort((a, b) => b.score - a.score).slice(0, max);
      } catch (e) {
        console.warn('getTopScores falhou', e);
        return [];
      }
    }
  }

  let entries = readLocal().filter((e) => e.periodId === periodId);
  if (params.board) entries = entries.filter((e) => e.board === params.board);
  else {
    entries = dedupeByUser(entries.filter((e) => e.scope === 'weekly'));
  }
  return entries.sort((a, b) => b.score - a.score).slice(0, max);
}

/**
 * Returns the player's 1-based rank for a board/period (1 + number of scores
 * strictly higher). Returns null when the player has no score there.
 */
export async function getPlayerRank(
  params: QueryParams,
  myScore: number,
): Promise<number | null> {
  if (myScore <= 0) return null;
  // Exact rank needs a single board to count against; the "Geral" (no board)
  // view aggregates per-user bests, so we skip the pinned row there in all
  // modes for consistency.
  if (!params.board) return null;
  const periodId = periodFor(params.scope);

  if (firebaseEnabled) {
    const db = getDb();
    if (!db) return null;
    try {
      // Single-field query (no composite index); count higher scores client-side.
      const base = collection(db, COLLECTION);
      const q = query(base, where('periodId', '==', periodId));
      const snap = await withTimeout(getDocs(q));
      const higher = snap.docs
        .map((d) => d.data() as LeaderEntry)
        .filter((e) => e.board === params.board && e.score > myScore).length;
      return higher + 1;
    } catch {
      return null;
    }
  }

  const entries = readLocal().filter(
    (e) => e.periodId === periodId && e.board === params.board,
  );
  const higher = entries.filter((e) => e.score > myScore).length;
  return higher + 1;
}

export function isGlobalLeaderboard(): boolean {
  return firebaseEnabled;
}

/** Deletes all of a user's leaderboard entries (for account deletion). */
export async function deleteUserScores(uid: string): Promise<void> {
  if (!firebaseEnabled || !uid) return;
  const db = getDb();
  if (!db) return;
  try {
    const q = query(collection(db, COLLECTION), where('uid', '==', uid));
    const snap = await withTimeout(getDocs(q));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  } catch (e) {
    console.warn('deleteUserScores falhou', e);
  }
}

/**
 * Corrects the country on a user's existing leaderboard entries to match the
 * device's current detected country (fixes flags saved before the time-zone
 * detection). Only writes the entries whose country actually differs.
 */
export async function refreshUserCountry(uid: string): Promise<void> {
  if (!firebaseEnabled || !uid) return;
  const country = getCountryCode();
  if (!country) return;
  const db = getDb();
  if (!db) return;
  try {
    const q = query(collection(db, COLLECTION), where('uid', '==', uid));
    const snap = await withTimeout(getDocs(q));
    await Promise.all(
      snap.docs
        .filter((d) => (d.data() as LeaderEntry).country !== country)
        .map((d) => setDoc(d.ref, { country }, { merge: true })),
    );
  } catch (e) {
    console.warn('refreshUserCountry falhou', e);
  }
}

/**
 * A short, stable identifier derived from the account uid (e.g. "A3F2"). It
 * never changes even if the player renames, so the same person is always
 * recognizable in the ranking. Returns null for local/guest entries (no uid).
 */
export function playerTag(uid?: string): string | null {
  if (!uid) return null;
  let h = 2166136261;
  for (let i = 0; i < uid.length; i++) {
    h ^= uid.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36).toUpperCase().padStart(4, '0').slice(-4);
}

/**
 * Updates the display name on all of a user's existing leaderboard entries, so
 * changing the nickname is reflected on past scores (not just new ones).
 */
export async function renameUserScores(
  uid: string,
  name: string,
): Promise<void> {
  if (!firebaseEnabled || !uid) return;
  const db = getDb();
  if (!db) return;
  try {
    const base = collection(db, COLLECTION);
    // Single-field equality query — no composite index required.
    const q = query(base, where('uid', '==', uid));
    const snap = await withTimeout(getDocs(q));
    await Promise.all(
      snap.docs.map((d) => setDoc(d.ref, { name }, { merge: true })),
    );
  } catch (e) {
    console.warn('renameUserScores falhou', e);
  }
}
