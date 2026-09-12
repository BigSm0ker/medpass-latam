import type { DistributionRule, PollarClient } from "@pollar/core";
import { describe, expect, it, vi } from "vitest";
import {
  claimSettlementFaucet,
  listSettlementFaucets,
  toClaimableRule,
} from "./funding";

function rule(overrides: Partial<DistributionRule> = {}): DistributionRule {
  return {
    id: "rule-1",
    name: "Test faucet",
    assetCode: "USDC",
    amount: "10",
    period: "DAY",
    validFrom: null,
    validUntil: null,
    claimable: true,
    reason: null,
    ...overrides,
  } as DistributionRule;
}

describe("listSettlementFaucets", () => {
  it("puts settlement-asset rules ahead of unrelated ones", async () => {
    const client = {
      listDistributionRules: vi
        .fn()
        .mockResolvedValue([
          rule({ id: "xlm", assetCode: "XLM" }),
          rule({ id: "usdc", assetCode: "USDC" }),
        ]),
    } as unknown as PollarClient;

    const rules = await listSettlementFaucets(client);

    expect(rules.map((r) => r.id)).toEqual(["usdc", "xlm"]);
  });

  it("preserves the server's reason for an unclaimable rule", () => {
    expect(
      toClaimableRule(rule({ claimable: false, reason: "ALREADY_CLAIMED" })),
    ).toMatchObject({
      claimable: false,
      reason: "ALREADY_CLAIMED",
    });
  });
});

describe("claimSettlementFaucet", () => {
  it("treats a null transaction hash as a successful claim", async () => {
    const client = {
      claimDistributionRule: vi.fn().mockResolvedValue({
        ruleId: "usdc",
        assetCode: "USDC",
        amount: "10",
        txHash: null,
      }),
    } as unknown as PollarClient;

    expect(await claimSettlementFaucet(client, "usdc")).toEqual({
      status: "claimed",
      amount: "10",
      assetCode: "USDC",
      txHash: null,
    });
  });

  it("returns a typed error instead of throwing", async () => {
    const client = {
      claimDistributionRule: vi.fn().mockRejectedValue(new Error("RULE_NOT_CLAIMABLE")),
    } as unknown as PollarClient;

    expect(await claimSettlementFaucet(client, "usdc")).toEqual({
      status: "error",
      message: "RULE_NOT_CLAIMABLE",
    });
  });
});
