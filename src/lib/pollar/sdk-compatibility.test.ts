import { describe, expect, it } from "vitest";
import { pollarCoreVersion } from "./sdk-compatibility";

describe("Pollar SDK baseline", () => {
  it("loads the pinned core package without configuring a network client", () => {
    expect(pollarCoreVersion).toBe("0.11.3");
  });
});
