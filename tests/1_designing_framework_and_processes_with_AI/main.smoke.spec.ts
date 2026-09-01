import { expect, test } from "@playwright/test";

test(
  "homepage has title 'Rolnopol'",
  { tag: ["@e2e", "@smoke"] },
  async ({ page }) => {
    // Arrange
    const expected = {
      title: "Rolnopol",
    };

    // Act
    await page.goto("/");

    // Assert
    await expect(page).toHaveTitle(expected.title);
  },
);

test(
  "clicking 'Get Started Free' navigates to account creation page",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    // Arrange
    const expected = {
      heading: "Create Your User Account",
    };

    // Act
    await page.goto("/");
    await page.getByRole("link", { name: "Get Started Free" }).click();

    // Assert
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
    // Arrange
    const expected = {
      title: "Login - Rolnopol",
      subtitle: "User Login & Account Access",
    };

    // Act
    await page.goto("/login.html");

    // Assert
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
    // Arrange
    const expected = {
      title: "Register - Rolnopol",
      subtitle: "Create Your User Account",
    };

    // Act
    await page.goto("/register.html");

    // Assert
    await expect(page).toHaveTitle(expected.title);
    await expect(page.getByTestId("register-subtitle")).toHaveText(
      expected.subtitle,
    );

    await page.close();
  },
);

test(
  "register with valid data succeeds and redirects to login",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    test.setTimeout(15_000); // registration redirects to login a few seconds after the success toast

    // Arrange
    const email = `jane.tester+${Date.now()}@example.com`;
    const expected = {
      displayName: "Jane Tester",
      password: "SecurePass123",
      redirectTitle: "Login - Rolnopol",
    };

    // Act
    await page.goto("/register.html");
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("display-name-input").fill(expected.displayName);
    await page.getByTestId("password-input").fill(expected.password);
    await page.getByTestId("register-submit-btn").click();

    // Assert
    await expect(page.getByText("Registration successful!")).toBeVisible();
    await expect(page).toHaveURL(/\/login\.html$/, { timeout: 8000 });
    await expect(page).toHaveTitle(expected.redirectTitle);

    await page.close();
  },
);

test(
  "documentation page loads and is visible",
  { tag: ["@docs"] },
  async ({ page }) => {
    // Arrange
    const expected = {
      subtitle: "Rolnopol System Guide & API Reference",
    };

    // Act
    await page.goto("/docs.html");

    // Assert
    // No test id is available; fall back to the subtitle's class.
    await expect(page.locator(".docs-header-subtitle")).toHaveText(
      expected.subtitle,
    );

    await page.close();
  },
);

test(
  "API explorer page loads and is visible",
  { tag: ["@docs"] },
  async ({ page }) => {
    // Arrange
    const expected = {
      description:
        "API documentation for the Rolnopol service with versioning support",
    };

    // Act
    await page.goto("/swagger.html");

    // Assert
    // Swagger UI renders inside an iframe; no test id is available.
    const swaggerFrame = page.frameLocator("iframe");
    await expect(swaggerFrame.locator(".description")).toHaveText(
      expected.description,
    );

    await page.close();
  },
);
