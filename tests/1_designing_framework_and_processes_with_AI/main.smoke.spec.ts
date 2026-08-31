import { expect, test } from "@playwright/test";

test(
  "homepage has title containing 'Rolnopol'",
  { tag: ["@smoke"] },
  async ({ page }) => {
    await page.goto("/");

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Rolnopol/);

    await page.close();
  },
);

test(
  "clicking 'Get Started Free' navigates to account creation page",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    await page.goto("/");

    // Click the get started link.
    await page.getByRole("link", { name: "Get Started Free" }).click();

    // Expects page to have a heading for account creation.
    await expect(
      page.getByRole("heading", { name: "Create Your User Account" }),
    ).toBeVisible();

    await page.close();
  },
);

test(
  "login page loads and is visible",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    await page.goto("/login.html");

    await expect(page).toHaveTitle(/Rolnopol/);

    await expect(
      page.getByRole("heading", { name: "Login to Your User Account" }),
    ).toBeVisible();

    await page.close();
  },
);

test(
  "register page loads and is visible",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    await page.goto("/register.html");

    await expect(page).toHaveTitle(/Rolnopol/);

    await expect(
      page.getByRole("heading", { name: "Create Your User Account" }),
    ).toBeVisible();

    await page.close();
  },
);
