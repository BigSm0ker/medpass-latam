"use client";

import { LANGUAGES, LANGUAGE_NAMES, useLanguage } from "@/lib/i18n";

/**
 * The language switch.
 *
 * Two buttons rather than a dropdown: with exactly two options, a select costs a
 * tap and hides the alternative. `aria-pressed` carries the state for a screen
 * reader, and the group is labelled so it is not read as two loose buttons.
 */
export function LanguageToggle() {
  const { lang, setLang, copy } = useLanguage();

  return (
    <div
      role="group"
      aria-label={copy.languageLabel}
      className="inline-flex items-center rounded-full border border-slate-300 bg-white/70 p-0.5"
    >
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={
            lang === code
              ? "rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white"
              : "rounded-full px-3 py-1 text-xs font-semibold text-slate-600"
          }
        >
          {LANGUAGE_NAMES[code]}
        </button>
      ))}
    </div>
  );
}
