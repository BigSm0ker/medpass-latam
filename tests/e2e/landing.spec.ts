import { expect, test } from "@playwright/test";

test("the landing page tells a visitor what the product does", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Paga la consulta en segundos. Comparte solo lo que el médico necesita.",
    }),
  ).toBeVisible();

  // The prototype disclaimer is a standing commitment, not decoration.
  await expect(
    page.getByText("Prototipo de hackathon — no apto para uso clínico"),
  ).toBeVisible();

  // Both roles must be reachable from the front door, or a judge sees only half
  // of the product.
  await expect(page.getByRole("link", { name: /crear un cobro/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /mi pasaporte/i })).toBeVisible();
});

test("the patient entry point reaches a sign-in gate rather than an error", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /mi pasaporte/i }).click();

  await expect(page.getByRole("heading", { name: "Pasaporte médico" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /iniciar sesión con pollar/i }),
  ).toBeVisible();
});

test("an unknown charge code is refused without leaking anything", async ({ page }) => {
  await page.goto("/c/not-a-real-token");

  await expect(page.getByText(/no se encontró/i)).toBeVisible();
});
