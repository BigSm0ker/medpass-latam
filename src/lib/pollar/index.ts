/**
 * Public surface of the Pollar boundary.
 *
 * Feature code imports from here. Raw `@pollar/*` imports belong only to the
 * modules in this directory (AGENTS.md, ADR-004), so that an SDK change has
 * exactly one blast radius.
 */
export {
  MEDPASS_STELLAR_NETWORK,
  createPollarClientConfig,
  isApprovedSpendNetwork,
} from "./config";
export { MedPassPollarProvider } from "./provider";
export {
  SETTLEMENT_ASSET_CODE,
  canSettle,
  findSettlementAsset,
  findSettlementBalance,
  type SettlementAsset,
} from "./assets";
export {
  buildSettlementPayment,
  explorerUrl,
  isStellarAddress,
  isValidAmount,
  toSettlementResult,
  type PaymentRejection,
  type PaymentRequest,
  type SettlementResult,
} from "./payments";
export {
  claimSettlementFaucet,
  listSettlementFaucets,
  toClaimableRule,
  type ClaimResult,
  type ClaimableRule,
} from "./funding";
