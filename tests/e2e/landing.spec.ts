import { expect, test } from "@playwright/test";

test("the landing page tells a visitor what the product does", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Pay the clinic in seconds. Share only what the doctor needs.",
    }),
  ).toBeVisible();

  // The prototype disclaimer is a standing commitment, not decoration.
  await expect(
    page.getByText("Hackathon prototype — not for clinical use"),
  ).toBeVisible();

  // Both roles must be reachable from the front door, or a judge sees only half
  // of the product.
  await expect(page.getByRole("link", { name: /create a charge/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /my passport/i })).toBeVisible();
});

test("the patient entry point reaches a sign-in gate rather than an error", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /my passport/i }).click();

  await expect(page.getByRole("heading", { name: "Medical passport" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /sign in with pollar/i }),
  ).toBeVisible();
});

test("an unknown charge code is refused without leaking anything", async ({ page }) => {
  await page.goto("/c/not-a-real-token");

  await expect(page.getByText(/was not found/i)).toBeVisible();
});
