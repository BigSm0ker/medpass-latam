import { describe, expect, it } from "vitest";
import { MEDPASS_STELLAR_NETWORK, isApprovedSpendNetwork } from "./config";

describe("network policy", () => {
  it("pins the application to testnet", () => {
    expect(MEDPASS_STELLAR_NETWORK).toBe("testnet");
  });

  it("approves spending only on the pinned network", () => {
    expect(isApprovedSpendNetwork("testnet")).toBe(true);
    expect(isApprovedSpendNetwork("mainnet")).toBe(false);
  });
});
