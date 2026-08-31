import { expect, test } from "@playwright/test";

test(
  "homepage has title containing 'Rolnopol'",
  { tag: ["@e2e", "@smoke"] },
  async ({ page }) => {
    const expected = {
      title: "Rolnopol",
    };

    await page.goto("/");

    // Expect an exact title match.
    await expect(page).toHaveTitle(expected.title);
  },
);

test(
  "clicking 'Get Started Free' navigates to account creation page",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    const expected = {
      heading: "Create Your User Account",
    };

    await page.goto("/");

    await page.getByRole("link", { name: "Get Started Free" }).click();

    await expect(page.getByRole("heading", { level: 2 })).toHaveText(
      expected.heading,
    );

    await page.close();
  },
);

test(
  "login page loads and is visible",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    const expected = {
      title: "Login - Rolnopol",
      subtitle: "User Login & Account Access",
    };

    await page.goto("/login.html");

    await expect(page).toHaveTitle(expected.title);
    await expect(page.getByTestId("login-subtitle")).toHaveText(
      expected.subtitle,
    );

    await page.close();
  },
);

test(
  "register page loads and is visible",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    const expected = {
      title: "Register - Rolnopol",
      subtitle: "Create Your User Account",
    };

    await page.goto("/register.html");

    await expect(page).toHaveTitle(expected.title);
    await expect(page.getByTestId("register-subtitle")).toHaveText(
      expected.subtitle,
    );

    await page.close();
  },
);

test(
  "documentation page loads and is visible",
  { tag: ["@docs", "@smoke"] },
  async ({ page }) => {
    const expected = {
      subtitle: "Rolnopol System Guide & API Reference",
    };

    await page.goto("/docs.html");

    // No test id is available; fall back to the subtitle's class.
    await expect(page.locator(".docs-header-subtitle")).toHaveText(
      expected.subtitle,
    );

    await page.close();
  },
);

test(
  "API explorer page loads and is visible",
  { tag: ["@docs", "@smoke"] },
  async ({ page }) => {
    const expected = {
      description:
        "API documentation for the Rolnopol service with versioning support",
    };

    await page.goto("/swagger.html");

    // Swagger UI renders inside an iframe; no test id is available.
    const swaggerFrame = page.frameLocator("iframe");
    await expect(swaggerFrame.locator(".description")).toHaveText(
      expected.description,
    );

    await page.close();
  },
);
