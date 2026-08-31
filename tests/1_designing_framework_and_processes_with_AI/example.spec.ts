import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Rolnopol/);

  await page.close();
});

test("get started link", async ({ page }) => {
  await page.goto("/");

  // Click the get started link.
  await page.getByRole("link", { name: "Get Started Free" }).click();

  // Expects page to have a heading for account creation.
  await expect(
    page.getByRole("heading", { name: "Create Your User Account" }),
  ).toBeVisible();

  await page.close();
});
