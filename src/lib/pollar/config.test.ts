import { describe, expect, it } from "vitest";
import { MEDPASS_STELLAR_NETWORK, isApprovedSpendNetwork } from "./config";

describe("network policy", () => {
  // Deliberately a literal rather than a reference to the constant: changing the
  // network must fail here too, so the switch is never a one-file accident.
  it("pins the application to mainnet", () => {
    expect(MEDPASS_STELLAR_NETWORK).toBe("mainnet");
  });

  it("approves spending only on the pinned network", () => {
    expect(isApprovedSpendNetwork("mainnet")).toBe(true);
    expect(isApprovedSpendNetwork("testnet")).toBe(false);
  });
});
