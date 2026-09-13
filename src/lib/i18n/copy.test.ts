import { describe, expect, it } from "vitest";
import { COPY, LANGUAGES, type Language } from "./copy";

/**
 * TypeScript already forces the two dictionaries to have the same shape. This
 * test guards what the type system cannot: a translation that was pasted but
 * never translated, or a string left empty. A blank label on a consent screen is
 * a safety problem, not a cosmetic one.
 */
function flatten(value: unknown, path: string[] = []): [string, unknown][] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flatten(item, [...path, String(index)]));
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      flatten(child, [...path, key]),
    );
  }
  return [[path.join("."), value]];
}

const entries = Object.fromEntries(
  LANGUAGES.map((lang) => [lang, new Map(flatten(COPY[lang]))]),
) as Record<Language, Map<string, unknown>>;

describe("the copy dictionary", () => {
  it("defines exactly the same keys in every language", () => {
    expect([...entries.en.keys()].sort()).toEqual([...entries.es.keys()].sort());
  });

  it.each(LANGUAGES)("has no empty string in %s", (lang) => {
    const blank = [...entries[lang]]
      .filter(([, value]) => typeof value === "string" && value.trim() === "")
      .map(([key]) => key);

    expect(blank).toEqual([]);
  });

  it("translates every string rather than repeating the Spanish", () => {
    // Proper nouns and codes are legitimately identical in both languages.
    const allowed = new Set(["brand"]);

    const untranslated = [...entries.es]
      .filter(([key, value]) => typeof value === "string" && !allowed.has(key))
      .filter(([key, value]) => entries.en.get(key) === value)
      .map(([key]) => key);

    expect(untranslated).toEqual([]);
  });
});
