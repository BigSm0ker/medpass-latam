// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe("server environment boundary (node runtime)", () => {
  it("names the missing variable without revealing any value", async () => {
    delete process.env.POLLAR_SECRET_KEY;
    const { getServerEnv } = await import("./server");

    expect(() => getServerEnv()).toThrow(/POLLAR_SECRET_KEY/);
  });

  it("reports configured server credentials without returning them", async () => {
    process.env.POLLAR_SECRET_KEY = "synthetic-not-a-real-key";
    const { hasServerPollarKey } = await import("./server");

    expect(hasServerPollarKey()).toBe(true);
  });

  it("parses a configured server environment", async () => {
    process.env.POLLAR_SECRET_KEY = "synthetic-not-a-real-key";
    const { getServerEnv } = await import("./server");

    expect(getServerEnv().POLLAR_SECRET_KEY).toBe("synthetic-not-a-real-key");
  });
});
