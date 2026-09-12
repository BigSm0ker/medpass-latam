import type { PollarClientConfig, StellarNetwork } from "@pollar/core";
import { getClientEnv } from "@/lib/env/client";

/**
 * The only network this application is allowed to configure.
 *
 * Mainnet is a deliberate, human-approved release step (ADR-004). Keeping the
 * constant here means a Mainnet switch is a reviewable diff in one file rather
 * than an environment variable somebody can flip by accident.
 */
export const MEDPASS_STELLAR_NETWORK: StellarNetwork = "testnet";

/** Human-readable device label shown in Pollar's active-sessions UI. */
const DEVICE_LABEL = "MedPass LATAM (prototype)";

/**
 * Builds the Pollar client configuration from validated browser-safe
 * environment values.
 *
 * `stellarNetwork` is pinned rather than derived from configuration so that no
 * deployment can silently run the demo against Mainnet.
 */
export function createPollarClientConfig(): PollarClientConfig {
  const { NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY } = getClientEnv();

  return {
    apiKey: NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY,
    stellarNetwork: MEDPASS_STELLAR_NETWORK,
    deviceLabel: DEVICE_LABEL,
    logLevel: process.env.NODE_ENV === "development" ? "debug" : "error",
  };
}

/**
 * Guard used before any transaction path. Returns true only while the client
 * is on the network this phase is authorized to spend on.
 */
export function isApprovedSpendNetwork(network: StellarNetwork): boolean {
  return network === MEDPASS_STELLAR_NETWORK;
}
