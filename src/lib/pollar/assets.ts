import type { EnabledAssetRecord, WalletBalanceRecord } from "@pollar/core";

/** The settlement asset for MedPass encounters. */
export const SETTLEMENT_ASSET_CODE = "USDC";

/**
 * A Stellar credit asset resolved from the application's own dashboard
 * catalog.
 *
 * The issuer is deliberately never hard-coded. Pollar answers
 * `refreshAssets()` with the assets this application is actually provisioned
 * for on the active network, and the TestNet issuer differs from Mainnet's.
 * Reading it at runtime is both correct and what makes the eventual Mainnet
 * switch a configuration change rather than a code change.
 */
export type SettlementAsset = {
  code: string;
  issuer: string;
  /** True when the wallet already holds the trustline required to receive it. */
  trustlineEstablished: boolean;
  /** True when the application covers the trustline reserve and fee. */
  sponsored: boolean;
};

function isStellarCreditAsset(record: EnabledAssetRecord): boolean {
  const chain = record.chain ?? "STELLAR";
  return (
    chain === "STELLAR" && typeof record.issuer === "string" && record.issuer.length > 0
  );
}

/**
 * Finds the USDC entry in the application's enabled-asset catalog.
 *
 * Returns `null` rather than throwing: an application that has not enabled
 * USDC on this network is a configuration state the UI must surface, not an
 * exception that blanks the page.
 */
export function findSettlementAsset(
  assets: readonly EnabledAssetRecord[] | undefined,
): SettlementAsset | null {
  if (!assets?.length) return null;

  const match = assets.find(
    (record) =>
      record.code.toUpperCase() === SETTLEMENT_ASSET_CODE &&
      isStellarCreditAsset(record),
  );

  if (!match?.issuer) return null;

  return {
    code: match.code,
    issuer: match.issuer,
    trustlineEstablished: match.trustlineEstablished ?? false,
    sponsored: match.sponsored ?? false,
  };
}

/**
 * Reads the spendable amount of the settlement asset from a balance snapshot.
 *
 * Pollar distinguishes `balance` (held) from `available` (spendable after
 * reserves and liabilities). Payments must be judged against `available`;
 * using `balance` would let the UI offer a payment the ledger will reject.
 */
export function findSettlementBalance(
  balances: readonly WalletBalanceRecord[] | undefined,
  asset: Pick<SettlementAsset, "code" | "issuer">,
): { available: string | null; balance: string | null } | null {
  if (!balances?.length) return null;

  const match = balances.find(
    (record) =>
      record.code.toUpperCase() === asset.code.toUpperCase() &&
      record.issuer === asset.issuer,
  );

  if (!match) return null;

  return { available: match.available, balance: match.balance };
}

/**
 * True when the wallet can actually settle `amount` of the asset right now.
 * Non-numeric or absent balances answer `false` rather than guessing.
 */
export function canSettle(
  available: string | null | undefined,
  amount: string,
): boolean {
  if (!available) return false;

  const availableValue = Number(available);
  const amountValue = Number(amount);

  if (!Number.isFinite(availableValue) || !Number.isFinite(amountValue)) return false;
  if (amountValue <= 0) return false;

  return availableValue >= amountValue;
}
