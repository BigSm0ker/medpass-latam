import "server-only";
import { getServiceClient } from "@/lib/supabase/server";
import { MEDPASS_STELLAR_NETWORK } from "@/lib/pollar/config";

/**
 * Payment records bound to an encounter.
 *
 * The chain is the source of truth for whether money moved; this table exists so
 * the product can show a receipt against a specific consultation. Nothing here is
 * ever written into a transaction memo — an on-chain reference to a medical
 * encounter would defeat ADR-003.
 */
export type RecordPaymentInput = {
  encounterId: string;
  amountUsdc: string;
  status: "pending" | "success" | "error";
  txHash?: string | null;
  failureReason?: string | null;
};

export async function recordPayment(input: RecordPaymentInput): Promise<void> {
  const supabase = getServiceClient();

  const { error } = await supabase.from("payments").upsert(
    {
      encounter_id: input.encounterId,
      amount_usdc: input.amountUsdc,
      status: input.status,
      tx_hash: input.txHash ?? null,
      failure_reason: input.failureReason ?? null,
      network: MEDPASS_STELLAR_NETWORK,
    },
    { onConflict: "encounter_id" },
  );

  if (error) throw new Error(`Could not record the payment: ${error.message}`);

  // Only a confirmed payment advances the encounter. A pending or failed attempt
  // leaves it consented, so a retry is a normal continuation rather than a second
  // charge — and a receipt never claims a settlement the ledger has not confirmed.
  if (input.status === "success") {
    const { error: statusError } = await supabase
      .from("encounters")
      .update({ status: "paid" })
      .eq("id", input.encounterId);

    if (statusError)
      throw new Error(`Could not close the encounter: ${statusError.message}`);
  }
}

export type PaymentRecord = {
  status: "pending" | "success" | "error";
  txHash: string | null;
  amountUsdc: string;
  network: string;
  failureReason: string | null;
};

export async function getPayment(encounterId: string): Promise<PaymentRecord | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("payments")
    .select("status, tx_hash, amount_usdc, network, failure_reason")
    .eq("encounter_id", encounterId)
    .maybeSingle();

  if (error) throw new Error(`Could not read the payment: ${error.message}`);
  if (!data) return null;

  return {
    status: data.status as PaymentRecord["status"],
    txHash: data.tx_hash as string | null,
    amountUsdc: data.amount_usdc as string,
    network: data.network as string,
    failureReason: data.failure_reason as string | null,
  };
}
