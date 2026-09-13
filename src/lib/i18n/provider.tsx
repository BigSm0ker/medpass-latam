"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { COPY, LANGUAGES, type Copy, type Language } from "./copy";

const STORAGE_KEY = "medpass.language";

/**
 * The default is Spanish, and it is deliberate rather than incidental.
 *
 * The product is for Latin America, the server's own error strings are Spanish,
 * and the end-to-end test asserts Spanish landing copy. English is an opt-in for
 * a reader who wants it, not a change of the product's first language.
 */
export const DEFAULT_LANGUAGE: Language = "es";

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

/**
 * The stored preference is treated as an external store rather than as state.
 *
 * `useSyncExternalStore` is what makes this safe to hydrate: the server snapshot
 * is always the default, so the server HTML and the hydration render agree, and
 * React re-reads the real value immediately afterwards. Reading it into state
 * inside an effect would work too, but at the cost of a cascading render — and
 * of a flash of the wrong language on every load.
 */
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  // A second tab switching language should not leave this one disagreeing.
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    // Private browsing, or storage disabled. The default is still a good answer.
    return DEFAULT_LANGUAGE;
  }
}

function serverLanguage(): Language {
  return DEFAULT_LANGUAGE;
}

function storeLanguage(next: Language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Not being able to remember the choice is no reason to refuse it.
  }
  for (const listener of listeners) listener();
}

type LanguageContextValue = {
  lang: Language;
  setLang: (next: Language) => void;
  copy: Copy;
};

/**
 * `null` rather than a thrown error when the provider is missing.
 *
 * `useLanguage()` falls back to Spanish in that case. A screen someone forgets
 * to wrap should render the language it rendered before this feature existed —
 * it must never take a consent or payment screen down over a missing wrapper.
 */
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readStoredLanguage, serverLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Language) => storeLanguage(next), []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, copy: COPY[lang] }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

const FALLBACK: LanguageContextValue = {
  lang: DEFAULT_LANGUAGE,
  setLang: () => {},
  copy: COPY[DEFAULT_LANGUAGE],
};

/** The current language and the setter. Inert without a provider above it. */
export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext) ?? FALLBACK;
}

/** Just the strings — what nearly every call site actually wants. */
export function useCopy(): Copy {
  return useLanguage().copy;
}

/**
 * The current strings behind a stable ref.
 *
 * For callbacks that only read copy when the user actually invokes them — a
 * failed fetch's fallback message, say. Depending on `copy` directly would give
 * those callbacks a new identity on every language change, re-running the
 * effects built on them: switching language would silently refetch a consent
 * request or a passport. The ref keeps those dependency arrays exactly as they
 * were before this feature existed.
 */
export function useCopyRef() {
  const copy = useCopy();
  const ref = useRef(copy);

  useEffect(() => {
    ref.current = copy;
  }, [copy]);

  return ref;
}
