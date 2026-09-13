import "server-only";
import { randomBytes } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/server";
import { getPassport } from "@/features/passport/service";
import {
  checkConsent,
  projectPassport,
  type CreateEncounterInput,
  type DisclosedPassport,
  type EncounterHistoryItem,
  type EncounterRequestView,
  type EncounterStatus,
  type PassportField,
} from "@/schemas/encounter";

/**
 * Encounter lifecycle.
 *
 * Every function takes the acting party's Stellar address and scopes its work by
 * it. That address comes only from the verified session cookie — the service-role
 * client bypasses RLS, so this layer is the authorization boundary.
 */

type EncounterRow = {
  id: string;
  access_token: string;
  provider_profile_id: string;
  patient_profile_id: string | null;
  provider_label: string | null;
  reason: string | null;
  amount_usdc: string;
  requested_fields: PassportField[];
  approved_fields: PassportField[];
  status: EncounterStatus;
  request_expires_at: string;
  consent_expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

const COLUMNS =
  "id, access_token, provider_profile_id, patient_profile_id, provider_label, reason, amount_usdc, requested_fields, approved_fields, status, request_expires_at, consent_expires_at, revoked_at, created_at";

async function profileIdFor(address: string): Promise<string> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ stellar_address: address }, { onConflict: "stellar_address" })
    .select("id")
    .single();

  if (error) throw new Error(`Could not resolve profile: ${error.message}`);
  return data.id as string;
}

async function addressFor(profileId: string): Promise<string | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("stellar_address")
    .eq("id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return data.stellar_address as string;
}

async function loadByToken(token: string): Promise<EncounterRow | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("encounters")
    .select(COLUMNS)
    .eq("access_token", token)
    .maybeSingle();

  if (error) throw new Error(`Could not load the charge: ${error.message}`);
  return (data as EncounterRow | null) ?? null;
}

export type CreatedEncounter = { id: string; token: string; amountUsdc: string };

/** Opens a charge. The caller becomes its provider. */
export async function createEncounter(
  providerAddress: string,
  input: CreateEncounterInput,
): Promise<CreatedEncounter> {
  const supabase = getServiceClient();
  const providerProfileId = await profileIdFor(providerAddress);

  // Random, and derived from nothing about the patient or the encounter.
  const accessToken = randomBytes(24).toString("base64url");

  const { data, error } = await supabase
    .from("encounters")
    .insert({
      access_token: accessToken,
      provider_profile_id: providerProfileId,
      provider_label: input.providerLabel,
      reason: input.reason,
      amount_usdc: input.amountUsdc,
      requested_fields: input.requestedFields,
      status: "requested",
    })
    .select("id, access_token, amount_usdc")
    .single();

  if (error) throw new Error(`Could not create the charge: ${error.message}`);

  return {
    id: data.id as string,
    token: data.access_token as string,
    amountUsdc: data.amount_usdc as string,
  };
}

/**
 * What whoever scans the QR may see before deciding.
 *
 * Requires no session: the holder of the code is the intended patient, and they
 * must be able to see what is being asked *before* signing in or disclosing
 * anything. The payload carries no health content and no patient identifier.
 */
export async function getRequestView(
  token: string,
): Promise<EncounterRequestView | null> {
  const row = await loadByToken(token);
  if (!row) return null;

  return {
    token: row.access_token,
    providerLabel: row.provider_label,
    reason: row.reason,
    amountUsdc: row.amount_usdc,
    requestedFields: row.requested_fields,
    status: row.status,
    requestExpiresAt: row.request_expires_at,
    expired: new Date(row.request_expires_at).getTime() <= Date.now(),
  };
}

export type ConsentOutcome =
  | { ok: true; status: EncounterStatus }
  | { ok: false; reason: "not_found" | "expired" | "already_answered" };

/**
 * Records the patient's decision.
 *
 * Approved fields are intersected with what was actually requested rather than
 * trusted. Approving something nobody asked for is harmless in itself, but
 * storing it would mean the saved scope no longer describes the request the
 * patient was shown — and it would break the database's subset constraint.
 */
export async function recordConsent(
  patientAddress: string,
  token: string,
  decision: "approve" | "reject",
  approvedFields: readonly PassportField[],
  consentMinutes = 30,
): Promise<ConsentOutcome> {
  const row = await loadByToken(token);
  if (!row) return { ok: false, reason: "not_found" };
  if (row.status !== "requested") return { ok: false, reason: "already_answered" };
  if (new Date(row.request_expires_at).getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const supabase = getServiceClient();
  const patientProfileId = await profileIdFor(patientAddress);

  if (decision === "reject") {
    const { error } = await supabase
      .from("encounters")
      .update({
        patient_profile_id: patientProfileId,
        status: "rejected",
        approved_fields: [],
      })
      .eq("id", row.id);

    if (error) throw new Error(`Could not record the decision: ${error.message}`);
    return { ok: true, status: "rejected" };
  }

  const requested = new Set(row.requested_fields);
  const scoped = approvedFields.filter((field) => requested.has(field));

  const { error } = await supabase
    .from("encounters")
    .update({
      patient_profile_id: patientProfileId,
      status: "consented",
      approved_fields: scoped,
      consented_at: new Date().toISOString(),
      consent_expires_at: new Date(Date.now() + consentMinutes * 60_000).toISOString(),
    })
    .eq("id", row.id);

  if (error) throw new Error(`Could not record consent: ${error.message}`);
  return { ok: true, status: "consented" };
}

export type Disclosure =
  | {
      allowed: true;
      encounter: {
        id: string;
        amountUsdc: string;
        status: EncounterStatus;
        consentExpiresAt: string | null;
        approvedFields: PassportField[];
        requestedFields: PassportField[];
      };
      patientAddress: string;
      passport: DisclosedPassport;
    }
  | {
      allowed: false;
      reason: "not_found" | "not_consented" | "revoked" | "expired" | "no_fields";
    };

/**
 * Serves the provider exactly what the patient approved, while consent is live.
 *
 * Three gates in order: the caller must be this encounter's provider, consent
 * must currently authorize disclosure, and only then is the passport read and
 * projected down to the approved scope. Reading health data last means an
 * unauthorized caller never causes it to be loaded at all.
 */
export async function getDisclosure(
  providerAddress: string,
  token: string,
): Promise<Disclosure> {
  const row = await loadByToken(token);
  if (!row) return { allowed: false, reason: "not_found" };

  const providerProfileId = await profileIdFor(providerAddress);
  if (row.provider_profile_id !== providerProfileId) {
    // Deliberately identical to "not found": someone probing tokens should not
    // learn that one exists but belongs to another provider.
    return { allowed: false, reason: "not_found" };
  }

  const consent = checkConsent({
    status: row.status,
    approvedFields: row.approved_fields,
    consentExpiresAt: row.consent_expires_at,
    revokedAt: row.revoked_at,
  });
  if (!consent.allowed) return { allowed: false, reason: consent.reason };

  if (!row.patient_profile_id) return { allowed: false, reason: "not_consented" };
  const patientAddress = await addressFor(row.patient_profile_id);
  if (!patientAddress) return { allowed: false, reason: "not_consented" };

  const { passport } = await getPassport(patientAddress);

  return {
    allowed: true,
    encounter: {
      id: row.id,
      amountUsdc: row.amount_usdc,
      status: row.status,
      consentExpiresAt: row.consent_expires_at,
      approvedFields: row.approved_fields,
      requestedFields: row.requested_fields,
    },
    patientAddress,
    passport: projectPassport(passport, row.approved_fields),
  };
}

/** Withdraws access. Only the patient who granted it may do this. */
export async function revokeConsent(
  patientAddress: string,
  token: string,
): Promise<{ ok: boolean }> {
  const row = await loadByToken(token);
  if (!row) return { ok: false };

  const patientProfileId = await profileIdFor(patientAddress);
  if (row.patient_profile_id !== patientProfileId) return { ok: false };

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("encounters")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", row.id);

  if (error) throw new Error(`Could not revoke access: ${error.message}`);
  return { ok: true };
}

/** The encounter a patient is paying, resolved from its token and owned by them. */
export async function getPatientEncounter(
  patientAddress: string,
  token: string,
): Promise<EncounterRow | null> {
  const row = await loadByToken(token);
  if (!row || !row.patient_profile_id) return null;

  const patientProfileId = await profileIdFor(patientAddress);
  if (row.patient_profile_id !== patientProfileId) return null;

  return row;
}

/** The provider's payout address, needed to build the payment. */
export async function getProviderAddress(token: string): Promise<string | null> {
  const row = await loadByToken(token);
  if (!row) return null;
  return addressFor(row.provider_profile_id);
}

/**
 * A provider's recent charges, most recent first.
 *
 * Exists so a clinic sees this as a tool it uses every day rather than a
 * one-shot demo: past charges, what was approved out of what was asked, and a
 * link to the on-chain proof for anything paid.
 */
export async function listEncountersForProvider(
  providerAddress: string,
  limit = 20,
): Promise<EncounterHistoryItem[]> {
  const supabase = getServiceClient();
  const providerProfileId = await profileIdFor(providerAddress);

  const { data, error } = await supabase
    .from("encounters")
    .select(
      "access_token, provider_label, reason, amount_usdc, status, requested_fields, approved_fields, created_at, payments(status, tx_hash)",
    )
    .eq("provider_profile_id", providerProfileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load the history: ${error.message}`);

  type PaymentJoin = { status: "pending" | "success" | "error"; tx_hash: string | null };

  return (data ?? []).map((row) => {
    const joined = row.payments as PaymentJoin | PaymentJoin[] | null;
    const payment = Array.isArray(joined) ? (joined[0] ?? null) : joined;

    return {
      token: row.access_token as string,
      providerLabel: row.provider_label as string | null,
      reason: row.reason as string | null,
      amountUsdc: row.amount_usdc as string,
      status: row.status as EncounterStatus,
      requestedFields: row.requested_fields as PassportField[],
      approvedFields: row.approved_fields as PassportField[],
      createdAt: row.created_at as string,
      payment: payment ? { status: payment.status, txHash: payment.tx_hash } : null,
    };
  });
}
