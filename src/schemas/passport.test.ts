import { describe, expect, it } from "vitest";
import { emptyPassport, passportInputSchema, passportSchema } from "./passport";

describe("passport input normalization", () => {
  it("drops blank entries so an empty row never becomes a clinical fact", () => {
    const parsed = passportInputSchema.parse({
      allergies: ["Penicillin", "   ", ""],
      medications: [],
      conditions: [],
    });

    expect(parsed.allergies).toEqual(["Penicillin"]);
  });

  it("trims entries", () => {
    expect(passportInputSchema.parse({ allergies: ["  Latex  "] }).allergies).toEqual([
      "Latex",
    ]);
  });

  it("turns empty contact strings into null rather than storing blanks", () => {
    const parsed = passportInputSchema.parse({
      emergencyContactName: "",
      emergencyContactPhone: "   ",
      notes: "",
    });

    expect(parsed.emergencyContactName).toBeNull();
    expect(parsed.emergencyContactPhone).toBeNull();
    expect(parsed.notes).toBeNull();
  });

  it("defaults an unspecified passport to the empty one", () => {
    expect(passportInputSchema.parse({})).toEqual(emptyPassport);
  });

  it("rejects an unknown blood type", () => {
    expect(passportInputSchema.safeParse({ bloodType: "Z+" }).success).toBe(false);
  });

  it("rejects an over-long entry instead of truncating it", () => {
    expect(
      passportInputSchema.safeParse({ allergies: ["x".repeat(200)] }).success,
    ).toBe(false);
  });

  it("caps the number of entries that survive cleaning", () => {
    const many = Array.from({ length: 25 }, (_, i) => `entry ${i}`);
    expect(passportInputSchema.safeParse({ allergies: many }).success).toBe(false);
  });

  it("accepts a list of blanks as simply empty", () => {
    expect(passportInputSchema.parse({ allergies: ["", "  ", ""] }).allergies).toEqual(
      [],
    );
  });
});

describe("passport schema", () => {
  it("accepts the empty passport as valid", () => {
    expect(passportSchema.safeParse(emptyPassport).success).toBe(true);
  });

  it("requires nullable contacts to be explicit, not undefined", () => {
    const withoutContact: Record<string, unknown> = { ...emptyPassport };
    delete withoutContact.emergencyContactName;

    expect(passportSchema.safeParse(withoutContact).success).toBe(false);
  });
});
