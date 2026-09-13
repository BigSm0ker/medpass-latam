import type { SendPaymentParams, StellarNetwork, SubmitOutcome } from "@pollar/core";
import { isApprovedSpendNetwork } from "./config";
import type { SettlementAsset } from "./assets";

/** A Stellar public key: 56 characters, base32, always starting with `G`. */
const STELLAR_ADDRESS = /^G[A-Z2-7]{55}$/;

export function isStellarAddress(value: string): boolean {
  return STELLAR_ADDRESS.test(value);
}

/** A positive decimal amount with at most 7 fractional digits (Stellar's precision). */
const DECIMAL_AMOUNT = /^\d+(\.\d{1,7})?$/;

export function isValidAmount(value: string): boolean {
  return DECIMAL_AMOUNT.test(value) && Number(value) > 0;
}

/**
 * A payment the adapter refused to build, with a reason the UI can render.
 * Returning this instead of throwing keeps the failure path typed.
 */
export type PaymentRejection = {
  ok: false;
  reason: "invalid_destination" | "invalid_amount" | "network_not_approved";
  message: string;
};

export type PaymentRequest = { ok: true; params: SendPaymentParams };

/**
 * Builds a validated `sendPayment` payload for an encounter settlement.
 *
 * Every rejection is checked here rather than at the call site so that no UI
 * path can reach the SDK with an unvalidated destination, a malformed amount,
 * or — most importantly — a network this phase has no authorization to spend
 * on. The network check is the last line of defense behind the pinned config.
 */
export function buildSettlementPayment(input: {
  destination: string;
  amount: string;
  asset: Pick<SettlementAsset, "code" | "issuer">;
  network: StellarNetwork;
}): PaymentRequest | PaymentRejection {
  // Coerced rather than trusted. The type says string, but this value has
  // travelled from a Postgres `numeric` through JSON, and the SDK rejects a
  // number outright — a failure that surfaces only at submission time, in front
  // of whoever is paying.
  const amount = String(input.amount);

  if (!isApprovedSpendNetwork(input.network)) {
    return {
      ok: false,
      reason: "network_not_approved",
      message:
        "Este pago no corresponde a la red en la que está fijado este despliegue.",
    };
  }

  if (!isStellarAddress(input.destination)) {
    return {
      ok: false,
      reason: "invalid_destination",
      message: "La dirección de destino no es una clave pública de Stellar válida.",
    };
  }

  if (!isValidAmount(amount)) {
    return {
      ok: false,
      reason: "invalid_amount",
      message: "El monto debe ser un número positivo con máximo 7 decimales.",
    };
  }

  return {
    ok: true,
    params: {
      chain: "STELLAR",
      destination: input.destination,
      amount,
      asset: {
        type: "credit_alphanum4",
        code: input.asset.code,
        issuer: input.asset.issuer,
      },
    },
  };
}

/**
 * A payment result reduced to what the product needs to store and display.
 *
 * `pending` is kept distinct from `success`: Pollar returns it when the
 * network has accepted the transaction but the ledger has not confirmed it,
 * and an encounter receipt must not claim settlement before confirmation.
 */
export type SettlementResult =
  | { status: "success"; hash: string }
  | { status: "pending"; hash: string }
  | { status: "error"; message: string; hash?: string; code?: string };

/**
 * Renders an unknown error field as something a person can read.
 *
 * Pollar's error fields are typed as strings but do not always arrive as one:
 * a structured payload reached the consent screen as the literal text
 * "[object Object]", which told the patient nothing and hid the real failure
 * from us too. Stringifying rather than trusting the type keeps the actual
 * cause visible instead of swallowing it.
 */
function readableField(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed !== "[object Object]" ? trimmed : null;
  }
  if (value === null || value === undefined) return null;

  try {
    const json = JSON.stringify(value);
    return json && json !== "{}" && json !== "null" ? json : null;
  } catch {
    return null;
  }
}

/**
 * Normalizes a raw `SubmitOutcome` into the product's result shape.
 *
 * The error branch composes whichever of Pollar's several optional error
 * fields are present, because no single one is guaranteed, and falls back to
 * a generic message rather than rendering `undefined`.
 */
export function toSettlementResult(outcome: SubmitOutcome): SettlementResult {
  if (outcome.status === "success") {
    return { status: "success", hash: outcome.hash };
  }

  if (outcome.status === "pending") {
    return { status: "pending", hash: outcome.hash };
  }

  const message =
    readableField(outcome.message) ??
    readableField(outcome.details) ??
    readableField(outcome.resultCode) ??
    "El pago no pudo completarse.";

  return {
    status: "error",
    message,
    ...(outcome.hash ? { hash: outcome.hash } : {}),
    ...(outcome.code ? { code: outcome.code } : {}),
  };
}

/**
 * Public explorer URL for a confirmed transaction, used as the demo's
 * independent verification step.
 */
export function explorerUrl(hash: string, network: StellarNetwork): string {
  const segment = network === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${segment}/tx/${hash}`;
}
