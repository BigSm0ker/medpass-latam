import "server-only";
import { getServiceClient } from "@/lib/supabase/server";
import { emptyPassport, type Passport } from "@/schemas/passport";

/**
 * Passport persistence.
 *
 * Every function here takes the owner's Stellar address as its first argument
 * and scopes its query by it. The address always comes from the verified
 * session cookie, never from a request body — that single rule is what makes
 * the ownership boundary hold, because the service-role client bypasses RLS.
 */

type MedicalProfileRow = {
  blood_type: Passport["bloodType"];
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  updated_at: string;
};

function toPassport(row: MedicalProfileRow): Passport {
  return {
    bloodType: row.blood_type,
    allergies: row.allergies ?? [],
    medications: row.medications ?? [],
    conditions: row.conditions ?? [],
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    notes: row.notes,
  };
}

/**
 * Finds the profile row for an address, creating it on first sign-in.
 *
 * Uses upsert on the unique address so two concurrent first requests cannot
 * produce two profiles for the same wallet.
 */
async function ensureProfileId(address: string): Promise<string> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ stellar_address: address }, { onConflict: "stellar_address" })
    .select("id")
    .single();

  if (error) throw new Error(`Could not resolve profile: ${error.message}`);
  return data.id as string;
}

export type PassportRecord = { passport: Passport; updatedAt: string | null };

/**
 * Reads the caller's own passport.
 *
 * A patient who has never saved anything is not an error: they get an empty
 * passport so the UI can render a form instead of a failure.
 */
export async function getPassport(address: string): Promise<PassportRecord> {
  const supabase = getServiceClient();
  const profileId = await ensureProfileId(address);

  const { data, error } = await supabase
    .from("medical_profiles")
    .select(
      "blood_type, allergies, medications, conditions, emergency_contact_name, emergency_contact_phone, notes, updated_at",
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw new Error(`Could not read passport: ${error.message}`);
  if (!data) return { passport: emptyPassport, updatedAt: null };

  const row = data as MedicalProfileRow;
  return { passport: toPassport(row), updatedAt: row.updated_at };
}

/** Creates or replaces the caller's own passport. */
export async function savePassport(
  address: string,
  passport: Passport,
): Promise<PassportRecord> {
  const supabase = getServiceClient();
  const profileId = await ensureProfileId(address);

  const { data, error } = await supabase
    .from("medical_profiles")
    .upsert(
      {
        profile_id: profileId,
        blood_type: passport.bloodType,
        allergies: passport.allergies,
        medications: passport.medications,
        conditions: passport.conditions,
        emergency_contact_name: passport.emergencyContactName,
        emergency_contact_phone: passport.emergencyContactPhone,
        notes: passport.notes,
        is_synthetic: true,
      },
      { onConflict: "profile_id" },
    )
    .select(
      "blood_type, allergies, medications, conditions, emergency_contact_name, emergency_contact_phone, notes, updated_at",
    )
    .single();

  if (error) throw new Error(`Could not save passport: ${error.message}`);

  const row = data as MedicalProfileRow;
  return { passport: toPassport(row), updatedAt: row.updated_at };
}
