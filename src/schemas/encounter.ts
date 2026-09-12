import { z } from "zod";
import type { Passport } from "./passport";

/**
 * The closed set of fields a provider may request.
 *
 * Mirrors the `passport_field` enum in the database. Keeping it closed is what
 * lets the disclosure code reason exhaustively: there is no "other" bucket to
 * forget, and a field nobody defined cannot be asked for.
 */
export const PASSPORT_FIELDS = [
  "blood_type",
  "allergies",
  "medications",
  "conditions",
  "emergency_contact",
] as const;

export const passportFieldSchema = z.enum(PASSPORT_FIELDS);
export type PassportField = z.infer<typeof passportFieldSchema>;

/** Labels, so a patient is never asked to approve a database column name. */
export const FIELD_LABELS: Record<PassportField, string> = {
  blood_type: "Blood type",
  allergies: "Critical allergies",
  medications: "Current medications",
  conditions: "Relevant conditions",
  emergency_contact: "Emergency contact",
};

export const ENCOUNTER_STATUSES = [
  "requested",
  "consented",
  "rejected",
  "paid",
  "revoked",
] as const;
export const encounterStatusSchema = z.enum(ENCOUNTER_STATUSES);
export type EncounterStatus = z.infer<typeof encounterStatusSchema>;

/** Decimal string, matching what Pollar's `sendPayment` consumes. */
const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,7})?$/, "Use a number with up to 7 decimals")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero");

/** What a provider posts to open a charge. */
export const createEncounterSchema = z.object({
  amountUsdc: amountSchema,
  requestedFields: z.array(passportFieldSchema).min(1).max(PASSPORT_FIELDS.length),
  reason: z.string().trim().min(1).max(200),
  providerLabel: z.string().trim().min(1).max(120),
  /** How long disclosure stays open once the patient approves. */
  consentMinutes: z.number().int().min(5).max(240).default(30),
});

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;

/**
 * The patient's answer.
 *
 * `approvedFields` may be empty and may be a strict subset of what was asked:
 * partial consent is the product, not an edge case.
 */
export const consentSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  approvedFields: z.array(passportFieldSchema).default([]),
});

export const paymentRecordSchema = z.object({
  status: z.enum(["pending", "success", "error"]),
  txHash: z
    .string()
    .regex(/^[0-9a-f]{64}$/, "A Stellar transaction hash is 64 hex characters")
    .nullish(),
  failureReason: z.string().trim().max(300).nullish(),
});

/**
 * What the QR ultimately resolves to, shown before anything is disclosed.
 *
 * Note what is absent: no health content and no patient identifier. Someone who
 * intercepts the code learns only that a clinic is asking for a consultation fee.
 */
export type EncounterRequestView = {
  token: string;
  providerLabel: string | null;
  reason: string | null;
  amountUsdc: string;
  requestedFields: PassportField[];
  status: EncounterStatus;
  requestExpiresAt: string;
  expired: boolean;
};

/** Exactly the fields the patient approved, and nothing else. */
export type DisclosedPassport = Partial<
  Pick<Passport, "bloodType" | "allergies" | "medications" | "conditions"> & {
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  }
>;

/**
 * Projects a passport down to an approved scope.
 *
 * The most security-relevant function in the product, so it is written as an
 * allow-list: it starts from an empty object and adds only what the approved set
 * names. A deny-list — copy the passport, delete what was not approved — would
 * silently leak any field somebody adds to the passport later and forgets to
 * delete here.
 */
export function projectPassport(
  passport: Passport,
  approvedFields: readonly PassportField[],
): DisclosedPassport {
  const approved = new Set(approvedFields);
  const disclosed: DisclosedPassport = {};

  if (approved.has("blood_type")) disclosed.bloodType = passport.bloodType;
  if (approved.has("allergies")) disclosed.allergies = passport.allergies;
  if (approved.has("medications")) disclosed.medications = passport.medications;
  if (approved.has("conditions")) disclosed.conditions = passport.conditions;
  if (approved.has("emergency_contact")) {
    disclosed.emergencyContactName = passport.emergencyContactName;
    disclosed.emergencyContactPhone = passport.emergencyContactPhone;
  }

  return disclosed;
}

/**
 * Whether a consent still authorizes disclosure right now.
 *
 * Returns a reason rather than a boolean because "the patient revoked this" and
 * "this expired" are different events, and a clinician looking at an empty screen
 * deserves to know which one happened.
 */
export type ConsentCheck =
  | { allowed: true }
  | { allowed: false; reason: "not_consented" | "revoked" | "expired" | "no_fields" };

export function checkConsent(
  encounter: {
    status: EncounterStatus;
    approvedFields: readonly PassportField[];
    consentExpiresAt: string | null;
    revokedAt: string | null;
  },
  now: Date = new Date(),
): ConsentCheck {
  if (encounter.revokedAt || encounter.status === "revoked") {
    return { allowed: false, reason: "revoked" };
  }
  if (encounter.status !== "consented" && encounter.status !== "paid") {
    return { allowed: false, reason: "not_consented" };
  }
  if (!encounter.consentExpiresAt) return { allowed: false, reason: "not_consented" };
  if (new Date(encounter.consentExpiresAt).getTime() <= now.getTime()) {
    return { allowed: false, reason: "expired" };
  }
  if (encounter.approvedFields.length === 0)
    return { allowed: false, reason: "no_fields" };

  return { allowed: true };
}
