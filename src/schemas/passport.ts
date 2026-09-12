import { z } from "zod";

/**
 * The synthetic medical passport.
 *
 * Field choice is deliberately minimal: these are the items a provider needs in
 * an unfamiliar-clinic or emergency encounter, which is the story the demo
 * tells. Everything is free text rather than coded terminology — this is a
 * prototype, not a clinical system, and pretending otherwise would be a false
 * claim about what it does.
 */
export const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "unknown",
] as const;

export const bloodTypeSchema = z.enum(BLOOD_TYPES);
export type BloodType = z.infer<typeof bloodTypeSchema>;

/**
 * A list of short clinical entries.
 *
 * Entries are trimmed and blanks dropped so an empty row in the form does not
 * become an empty allergy that a provider might read as meaningful. The caps
 * exist to bound what a provider view has to render and what a consent scope
 * has to enumerate in Phase 3.
 */
const entryList = z
  // Bound the raw payload first, then clean, then validate what survived.
  // Order matters: validating before filtering would reject a blank row the
  // form legitimately produces, turning "the patient left a line empty" into
  // a 422 instead of a no-op.
  .array(z.string())
  .max(100)
  .transform((entries) =>
    entries.map((entry) => entry.trim()).filter((entry) => entry.length > 0),
  )
  .pipe(z.array(z.string().min(1).max(120)).max(20));

export const passportSchema = z.object({
  bloodType: bloodTypeSchema,
  allergies: entryList,
  medications: entryList,
  conditions: entryList,
  emergencyContactName: z.string().trim().max(120).nullable(),
  emergencyContactPhone: z.string().trim().max(40).nullable(),
  notes: z.string().trim().max(1000).nullable(),
});

export type Passport = z.infer<typeof passportSchema>;

/** What a fresh passport looks like before the patient has entered anything. */
export const emptyPassport: Passport = {
  bloodType: "unknown",
  allergies: [],
  medications: [],
  conditions: [],
  emergencyContactName: null,
  emergencyContactPhone: null,
  notes: null,
};

/**
 * Accepts the shape a form posts, where absent lists and empty strings are
 * normal, and normalizes it into the strict domain type.
 */
export const passportInputSchema = z
  .object({
    bloodType: bloodTypeSchema.default("unknown"),
    allergies: entryList.default([]),
    medications: entryList.default([]),
    conditions: entryList.default([]),
    emergencyContactName: z.string().trim().max(120).optional(),
    emergencyContactPhone: z.string().trim().max(40).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .transform((input): Passport => ({
    bloodType: input.bloodType,
    allergies: input.allergies,
    medications: input.medications,
    conditions: input.conditions,
    emergencyContactName: input.emergencyContactName?.length
      ? input.emergencyContactName
      : null,
    emergencyContactPhone: input.emergencyContactPhone?.length
      ? input.emergencyContactPhone
      : null,
    notes: input.notes?.length ? input.notes : null,
  }));

/** The signed-in wallet's proof, as posted to the sign-in route. */
export const sep53ProofSchema = z.object({
  token: z.string().min(1),
  signature: z.string().min(1),
  signerAddress: z.string().min(1),
});
