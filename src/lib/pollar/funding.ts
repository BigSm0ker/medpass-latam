import type { DistributionRule, PollarClient } from "@pollar/core";
import { SETTLEMENT_ASSET_CODE } from "./assets";

/**
 * TestNet asset acquisition.
 *
 * The official Pollar example warns that an app-initiated `fund()` helper does
 * not exist; distribution is claim-rule based and configured in the dashboard.
 * These helpers wrap that path so the demo can obtain test USDC without any
 * speculative call.
 */
export type ClaimableRule = {
  id: string;
  name: string;
  assetCode: string;
  amount: string;
  claimable: boolean;
  /** Why the rule is not claimable right now, when the server explains it. */
  reason: string | null;
};

export function toClaimableRule(rule: DistributionRule): ClaimableRule {
  return {
    id: rule.id,
    name: rule.name,
    assetCode: rule.assetCode,
    amount: rule.amount,
    claimable: rule.claimable,
    reason: rule.reason,
  };
}

/**
 * Lists the application's distribution rules, settlement-asset rules first so
 * the demo operator sees the USDC faucet before unrelated rules.
 */
export async function listSettlementFaucets(
  client: PollarClient,
): Promise<ClaimableRule[]> {
  const rules = await client.listDistributionRules();

  return rules.map(toClaimableRule).sort((a, b) => {
    const aIsSettlement = a.assetCode.toUpperCase() === SETTLEMENT_ASSET_CODE ? 0 : 1;
    const bIsSettlement = b.assetCode.toUpperCase() === SETTLEMENT_ASSET_CODE ? 0 : 1;
    return aIsSettlement - bIsSettlement;
  });
}

export type ClaimResult =
  | { status: "claimed"; amount: string; assetCode: string; txHash: string | null }
  | { status: "error"; message: string };

/**
 * Claims a distribution rule.
 *
 * `txHash` is legitimately nullable — the server may settle a claim without
 * surfacing a hash — so a null hash is reported as a successful claim rather
 * than treated as a failure.
 */
export async function claimSettlementFaucet(
  client: PollarClient,
  ruleId: string,
): Promise<ClaimResult> {
  try {
    const content = await client.claimDistributionRule({ ruleId });

    return {
      status: "claimed",
      amount: content.amount,
      assetCode: content.assetCode,
      txHash: content.txHash,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "The claim could not be completed.",
    };
  }
}
