import { describe, expect, it } from "vitest";
import { MEDPASS_STELLAR_NETWORK, isApprovedSpendNetwork } from "./config";

describe("network policy", () => {
  // Deliberately a literal rather than a reference to the constant: changing the
  // network must fail here too, so the switch is never a one-file accident.
  it("pins the application to testnet", () => {
    expect(MEDPASS_STELLAR_NETWORK).toBe("testnet");
  });

  it("approves spending only on the pinned network", () => {
    expect(isApprovedSpendNetwork("testnet")).toBe(true);
    expect(isApprovedSpendNetwork("mainnet")).toBe(false);
  });
});
