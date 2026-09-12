import { describe, expect, it } from "vitest";
import {
  buildSettlementPayment,
  explorerUrl,
  isStellarAddress,
  isValidAmount,
  toSettlementResult,
} from "./payments";

// Synthetic, well-formed Stellar public keys. Not funded, not real accounts.
const DESTINATION = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const USDC = {
  code: "USDC",
  issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
};

describe("address and amount validation", () => {
  it("accepts a well-formed Stellar public key", () => {
    expect(isStellarAddress(DESTINATION)).toBe(true);
  });

  it("rejects addresses of the wrong prefix or length", () => {
    expect(
      isStellarAddress("MA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"),
    ).toBe(false);
    expect(isStellarAddress("GA5ZSEJY")).toBe(false);
    expect(isStellarAddress("")).toBe(false);
  });

  it("accepts positive amounts within Stellar's seven-decimal precision", () => {
    expect(isValidAmount("1")).toBe(true);
    expect(isValidAmount("1.0000001")).toBe(true);
  });

  it("rejects zero, negative, malformed, and over-precise amounts", () => {
    expect(isValidAmount("0")).toBe(false);
    expect(isValidAmount("-1")).toBe(false);
    expect(isValidAmount("1.00000001")).toBe(false);
    expect(isValidAmount("abc")).toBe(false);
  });
});

describe("buildSettlementPayment", () => {
  it("builds a Stellar USDC payment on the approved network", () => {
    const result = buildSettlementPayment({
      destination: DESTINATION,
      amount: "1",
      asset: USDC,
      network: "testnet",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.params).toEqual({
      chain: "STELLAR",
      destination: DESTINATION,
      amount: "1",
      asset: { type: "credit_alphanum4", code: "USDC", issuer: USDC.issuer },
    });
  });

  it("refuses to build any payment on an unapproved network", () => {
    const result = buildSettlementPayment({
      destination: DESTINATION,
      amount: "1",
      asset: USDC,
      network: "mainnet",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("network_not_approved");
  });

  it("rejects an invalid destination before reaching the SDK", () => {
    const result = buildSettlementPayment({
      destination: "not-an-address",
      amount: "1",
      asset: USDC,
      network: "testnet",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("invalid_destination");
  });

  it("rejects a non-positive amount", () => {
    const result = buildSettlementPayment({
      destination: DESTINATION,
      amount: "0",
      asset: USDC,
      network: "testnet",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("invalid_amount");
  });
});

describe("toSettlementResult", () => {
  it("keeps pending distinct from success so a receipt cannot overclaim", () => {
    expect(toSettlementResult({ status: "pending", hash: "abc" })).toEqual({
      status: "pending",
      hash: "abc",
    });
    expect(toSettlementResult({ status: "success", hash: "abc" })).toEqual({
      status: "success",
      hash: "abc",
    });
  });

  it("composes an error message from whichever optional field is present", () => {
    expect(toSettlementResult({ status: "error", details: "tx_failed" })).toEqual({
      status: "error",
      message: "tx_failed",
    });
    expect(
      toSettlementResult({ status: "error", resultCode: "op_underfunded" }),
    ).toEqual({
      status: "error",
      message: "op_underfunded",
    });
  });

  it("falls back to a readable message when Pollar returns no detail", () => {
    expect(toSettlementResult({ status: "error" })).toEqual({
      status: "error",
      message: "The payment could not be completed.",
    });
  });
});

describe("explorerUrl", () => {
  it("points at the testnet explorer for testnet transactions", () => {
    expect(explorerUrl("abc", "testnet")).toBe(
      "https://stellar.expert/explorer/testnet/tx/abc",
    );
  });

  it("points at the public explorer for mainnet transactions", () => {
    expect(explorerUrl("abc", "mainnet")).toBe(
      "https://stellar.expert/explorer/public/tx/abc",
    );
  });
});
