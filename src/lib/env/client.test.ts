import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe("server environment boundary (browser runtime)", () => {
  it("refuses to load when a browser global is present", async () => {
    const { getServerEnv, hasServerPollarKey } = await import("./server");

    expect(() => getServerEnv()).toThrow(/imported in a browser context/);
    expect(() => hasServerPollarKey()).toThrow(/imported in a browser context/);
  });
});

describe("client environment boundary", () => {
  it("reports a missing publishable key instead of throwing", async () => {
    vi.stubEnv("NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY", "");
    const { hasClientPollarKey } = await import("./client");

    expect(hasClientPollarKey()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("returns the publishable key when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY", "pk_synthetic_test_value");
    const { getClientEnv } = await import("./client");

    expect(getClientEnv().NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY).toBe(
      "pk_synthetic_test_value",
    );
    vi.unstubAllEnvs();
  });
});
