import { describe, expect, it } from "vitest";
import {
  PASSPORT_FIELDS,
  checkConsent,
  consentSchema,
  createEncounterSchema,
  projectPassport,
  type EncounterStatus,
  type PassportField,
} from "./encounter";
import type { Passport } from "./passport";

const passport: Passport = {
  bloodType: "O+",
  allergies: ["Penicillin", "Latex"],
  medications: ["Metformin 500mg"],
  conditions: ["Type 2 diabetes"],
  emergencyContactName: "Ana Morales",
  emergencyContactPhone: "+591 700 00000",
  notes: "Private note the provider must never receive.",
};

describe("projectPassport — the disclosure boundary", () => {
  it("returns only the approved fields", () => {
    expect(projectPassport(passport, ["blood_type", "allergies"])).toEqual({
      bloodType: "O+",
      allergies: ["Penicillin", "Latex"],
    });
  });

  it("discloses nothing when nothing was approved", () => {
    expect(projectPassport(passport, [])).toEqual({});
  });

  it("never leaks notes, which no field can request", () => {
    const everything = projectPassport(passport, [...PASSPORT_FIELDS]);

    expect(everything).not.toHaveProperty("notes");
    expect(JSON.stringify(everything)).not.toContain("Private note");
  });

  it("treats the emergency contact as one field covering both parts", () => {
    expect(projectPassport(passport, ["emergency_contact"])).toEqual({
      emergencyContactName: "Ana Morales",
      emergencyContactPhone: "+591 700 00000",
    });
  });

  it("omits unapproved keys entirely rather than setting them undefined", () => {
    const disclosed = projectPassport(passport, ["conditions"]);

    expect(Object.keys(disclosed)).toEqual(["conditions"]);
    expect("medications" in disclosed).toBe(false);
  });

  it("is an allow-list: a field absent from the approved set is never emitted", () => {
    for (const field of PASSPORT_FIELDS) {
      const others = PASSPORT_FIELDS.filter((f) => f !== field);
      const disclosed = projectPassport(passport, others);
      const keysForField: Record<PassportField, string[]> = {
        blood_type: ["bloodType"],
        allergies: ["allergies"],
        medications: ["medications"],
        conditions: ["conditions"],
        emergency_contact: ["emergencyContactName", "emergencyContactPhone"],
      };

      for (const key of keysForField[field]) {
        expect(disclosed).not.toHaveProperty(key);
      }
    }
  });
});

describe("checkConsent — when disclosure is allowed", () => {
  const live = {
    status: "consented" as EncounterStatus,
    approvedFields: ["blood_type"] as PassportField[],
    consentExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    revokedAt: null,
  };

  it("allows a live consent", () => {
    expect(checkConsent(live)).toEqual({ allowed: true });
  });

  it("still allows reading after payment, so a receipt keeps its context", () => {
    expect(checkConsent({ ...live, status: "paid" })).toEqual({ allowed: true });
  });

  it("denies an expired consent", () => {
    expect(
      checkConsent({
        ...live,
        consentExpiresAt: new Date(Date.now() - 1).toISOString(),
      }),
    ).toEqual({ allowed: false, reason: "expired" });
  });

  it("denies a revoked consent even if its window has not elapsed", () => {
    expect(checkConsent({ ...live, revokedAt: new Date().toISOString() })).toEqual({
      allowed: false,
      reason: "revoked",
    });
    expect(checkConsent({ ...live, status: "revoked" })).toEqual({
      allowed: false,
      reason: "revoked",
    });
  });

  it("denies a request nobody has answered, and an explicit rejection", () => {
    expect(checkConsent({ ...live, status: "requested" })).toEqual({
      allowed: false,
      reason: "not_consented",
    });
    expect(checkConsent({ ...live, status: "rejected" })).toEqual({
      allowed: false,
      reason: "not_consented",
    });
  });

  it("denies a consent that approved no fields at all", () => {
    expect(checkConsent({ ...live, approvedFields: [] })).toEqual({
      allowed: false,
      reason: "no_fields",
    });
  });

  it("denies when there is no expiry to check", () => {
    expect(checkConsent({ ...live, consentExpiresAt: null })).toEqual({
      allowed: false,
      reason: "not_consented",
    });
  });

  it("evaluates expiry against the supplied clock, not the wall clock", () => {
    const at = new Date("2026-01-01T00:00:00Z");
    const consent = { ...live, consentExpiresAt: "2026-01-01T00:05:00Z" };

    expect(checkConsent(consent, at).allowed).toBe(true);
    expect(checkConsent(consent, new Date("2026-01-01T00:06:00Z"))).toEqual({
      allowed: false,
      reason: "expired",
    });
  });
});

describe("createEncounterSchema", () => {
  const valid = {
    amountUsdc: "1.5",
    requestedFields: ["blood_type"],
    reason: "Consultation",
    providerLabel: "Clínica San Martín",
  };

  it("accepts a well-formed charge and defaults the consent window", () => {
    const parsed = createEncounterSchema.parse(valid);
    expect(parsed.consentMinutes).toBe(30);
  });

  it("rejects a charge that requests nothing", () => {
    expect(
      createEncounterSchema.safeParse({ ...valid, requestedFields: [] }).success,
    ).toBe(false);
  });

  it("rejects non-positive and malformed amounts", () => {
    for (const amountUsdc of ["0", "-1", "abc", "1.00000001"]) {
      expect(createEncounterSchema.safeParse({ ...valid, amountUsdc }).success).toBe(
        false,
      );
    }
  });

  it("rejects an unknown field name", () => {
    expect(
      createEncounterSchema.safeParse({ ...valid, requestedFields: ["ssn"] }).success,
    ).toBe(false);
  });

  it("bounds the consent window on both sides", () => {
    expect(
      createEncounterSchema.safeParse({ ...valid, consentMinutes: 1 }).success,
    ).toBe(false);
    expect(
      createEncounterSchema.safeParse({ ...valid, consentMinutes: 1000 }).success,
    ).toBe(false);
  });
});

describe("consentSchema", () => {
  it("allows approving nothing, which is a real answer", () => {
    expect(consentSchema.parse({ decision: "approve" }).approvedFields).toEqual([]);
  });

  it("rejects an unknown decision", () => {
    expect(consentSchema.safeParse({ decision: "maybe" }).success).toBe(false);
  });
});
