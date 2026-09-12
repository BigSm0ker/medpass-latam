// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL = { ...process.env };

/** A fully configured server environment, with obviously synthetic values. */
function configure() {
  process.env.POLLAR_SECRET_KEY = "synthetic-pollar-secret";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "synthetic-supabase-secret";
  process.env.SESSION_SECRET = "synthetic-session-secret-long-enough-000000";
}

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe("server environment boundary (node runtime)", () => {
  it("parses a fully configured environment", async () => {
    configure();
    const { getServerEnv } = await import("./server");

    expect(getServerEnv().POLLAR_SECRET_KEY).toBe("synthetic-pollar-secret");
    expect(getServerEnv().SUPABASE_URL).toBe("https://example.supabase.co");
  });

  it("names every missing variable without revealing any value", async () => {
    delete process.env.POLLAR_SECRET_KEY;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SESSION_SECRET;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { getServerEnv } = await import("./server");

    expect(() => getServerEnv()).toThrow(/POLLAR_SECRET_KEY/);
    expect(() => getServerEnv()).toThrow(/SESSION_SECRET/);
  });

  it("rejects a session secret too short to be meaningful", async () => {
    configure();
    process.env.SESSION_SECRET = "tooshort";
    const { getServerEnv } = await import("./server");

    expect(() => getServerEnv()).toThrow(/SESSION_SECRET/);
  });

  it("reports configured server credentials without returning them", async () => {
    configure();
    const { hasServerPollarKey } = await import("./server");

    expect(hasServerPollarKey()).toBe(true);
  });
});
