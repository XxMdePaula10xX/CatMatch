import { create } from 'zustand';
import { STRINGS } from './strings';

export type Lang = 'pt' | 'en';

/** A string available in both supported languages. */
export interface LStr {
  pt: string;
  en: string;
}

const STORE_KEY = 'catmatch.lang';

/** First-run default: honor a saved choice, else guess from the device. */
function detectDefault(): Lang {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved === 'pt' || saved === 'en') return saved;
    const nav = (
      navigator.language ||
      (navigator.languages && navigator.languages[0]) ||
      ''
    ).toLowerCase();
    return nav.startsWith('pt') ? 'pt' : 'en';
  } catch {
    return 'pt';
  }
}

/**
 * Module-level mirror of the current language so non-React helpers (`t`, `tr`,
 * `nf`) can read it synchronously. Kept in sync by `setLang`.
 */
export let currentLang: Lang = detectDefault();

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: currentLang,
  setLang: (l) => {
    currentLang = l;
    try {
      localStorage.setItem(STORE_KEY, l);
    } catch {
      /* ignore */
    }
    set({ lang: l });
  },
}));

/** Reactive hook: returns the current language and re-renders on change. */
export function useLang(): Lang {
  return useLangStore((s) => s.lang);
}

export function setLang(l: Lang): void {
  useLangStore.getState().setLang(l);
}

/** Picks the right side of a bilingual string for the current language. */
export function tr(s: LStr): string {
  return s[currentLang] ?? s.pt;
}

/**
 * Looks up a UI string by key and interpolates `{var}` placeholders. Falls back
 * to the key itself if it's missing, so a gap is visible rather than crashing.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const entry = STRINGS[key];
  let str = entry ? entry[currentLang] : key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
    }
  }
  return str;
}

/**
 * Reactive hook returning the bound `t` function. Any component that renders
 * translated text should call this so it updates when the language changes.
 */
export function useT(): typeof t {
  useLang();
  return t;
}

/** Locale-aware number formatting (e.g. 10.000 in pt vs 10,000 in en). */
export function nf(n: number): string {
  return n.toLocaleString(currentLang === 'pt' ? 'pt-BR' : 'en-US');
}
