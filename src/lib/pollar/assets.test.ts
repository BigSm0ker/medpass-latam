import type { EnabledAssetRecord, WalletBalanceRecord } from "@pollar/core";
import { describe, expect, it } from "vitest";
import { canSettle, findSettlementAsset, findSettlementBalance } from "./assets";

const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

const catalog: EnabledAssetRecord[] = [
  { code: "XLM", type: "native", chain: "STELLAR" },
  {
    code: "USDC",
    issuer: USDC_ISSUER,
    type: "credit_alphanum4",
    chain: "STELLAR",
    trustlineEstablished: true,
    sponsored: true,
  },
];

describe("findSettlementAsset", () => {
  it("resolves USDC from the application catalog rather than a hard-coded issuer", () => {
    expect(findSettlementAsset(catalog)).toEqual({
      code: "USDC",
      issuer: USDC_ISSUER,
      trustlineEstablished: true,
      sponsored: true,
    });
  });

  it("treats a Stellar record without a chain tag as Stellar", () => {
    const legacy: EnabledAssetRecord[] = [{ code: "USDC", issuer: USDC_ISSUER }];

    expect(findSettlementAsset(legacy)?.issuer).toBe(USDC_ISSUER);
  });

  it("ignores a same-code asset issued on another chain", () => {
    const solana: EnabledAssetRecord[] = [
      { code: "USDC", chain: "SOLANA", type: "token", decimals: 6 },
    ];

    expect(findSettlementAsset(solana)).toBeNull();
  });

  it("returns null when the application has not enabled USDC", () => {
    expect(findSettlementAsset([{ code: "XLM", type: "native" }])).toBeNull();
    expect(findSettlementAsset([])).toBeNull();
    expect(findSettlementAsset(undefined)).toBeNull();
  });
});

describe("findSettlementBalance", () => {
  const balances: WalletBalanceRecord[] = [
    { code: "XLM", type: "native", balance: "5", available: "3" },
    { code: "USDC", issuer: USDC_ISSUER, balance: "10", available: "9.5" },
  ];

  it("returns both held and spendable amounts", () => {
    expect(
      findSettlementBalance(balances, { code: "USDC", issuer: USDC_ISSUER }),
    ).toEqual({
      balance: "10",
      available: "9.5",
    });
  });

  it("does not match an asset from a different issuer", () => {
    expect(
      findSettlementBalance(balances, { code: "USDC", issuer: "GDIFFERENTISSUER" }),
    ).toBeNull();
  });
});

describe("canSettle", () => {
  it("judges affordability against the spendable amount", () => {
    expect(canSettle("9.5", "1")).toBe(true);
    expect(canSettle("9.5", "9.5")).toBe(true);
    expect(canSettle("0.5", "1")).toBe(false);
  });

  it("refuses rather than guesses when the balance is unreadable", () => {
    expect(canSettle(null, "1")).toBe(false);
    expect(canSettle(undefined, "1")).toBe(false);
    expect(canSettle("not-a-number", "1")).toBe(false);
  });

  it("rejects a non-positive amount", () => {
    expect(canSettle("9.5", "0")).toBe(false);
  });
});
