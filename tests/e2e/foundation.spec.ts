import { expect, test } from "@playwright/test";

test("shows the Phase 0 foundation status", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Your health context, carried with consent." }),
  ).toBeVisible();
  await expect(
    page.getByText("Hackathon prototype — not for clinical use"),
  ).toBeVisible();
  await expect(page.getByText("Foundation ready")).toBeVisible();
});
