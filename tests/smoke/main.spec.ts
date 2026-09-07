import { expect, test } from "@playwright/test";
import { DocsPage } from "../../src/pages/DocsPage";
import { HomePage } from "../../src/pages/HomePage";
import { LoginPage } from "../../src/pages/LoginPage";
import { RegisterPage } from "../../src/pages/RegisterPage";
import { SwaggerPage } from "../../src/pages/SwaggerPage";
import { createTestUser } from "../../src/test-data/users";

test(
  "homepage has title 'Rolnopol'",
  { tag: ["@e2e", "@smoke"] },
  async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    const expected = {
      title: "Rolnopol",
    };

    // Act
    await homePage.goto();

    // Assert
    await expect(page).toHaveTitle(expected.title);
  },
);

test(
  "clicking 'Get Started Free' navigates to account creation page",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    const registerPage = new RegisterPage(page);
    const expected = {
      subtitle: "Create Your User Account",
    };

    // Act
    await homePage.goto();
    await homePage.clickGetStarted();

    // Assert
    await expect(registerPage.subtitle).toHaveText(expected.subtitle);

    await page.close();
  },
);

test(
  "login page loads and is visible",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const expected = {
      title: "Login - Rolnopol",
      subtitle: "User Login & Account Access",
    };

    // Act
    await loginPage.goto();

    // Assert
    await expect(page).toHaveTitle(expected.title);
    await expect(loginPage.subtitle).toHaveText(expected.subtitle);

    await page.close();
  },
);

test(
  "register page loads and is visible",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    // Arrange
    const registerPage = new RegisterPage(page);
    const expected = {
      title: "Register - Rolnopol",
      subtitle: "Create Your User Account",
    };

    // Act
    await registerPage.goto();

    // Assert
    await expect(page).toHaveTitle(expected.title);
    await expect(registerPage.subtitle).toHaveText(expected.subtitle);

    await page.close();
  },
);

test(
  "register with valid data succeeds and redirects to login",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    test.setTimeout(15_000);

    // Arrange
    const registerPage = new RegisterPage(page);
    const user = createTestUser();
    const expected = {
      redirectTitle: "Login - Rolnopol",
    };

    // Act
    await registerPage.goto();
    await registerPage.register(user);

    // Assert
    await expect(registerPage.successToast).toBeVisible();
    await expect(page).toHaveURL(/\/login\.html$/, { timeout: 8000 });
    await expect(page).toHaveTitle(expected.redirectTitle);

    await page.close();
  },
);

test(
  "registering with a duplicate email fails",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    test.setTimeout(15_000);

    // Arrange
    const registerPage = new RegisterPage(page);
    const user = createTestUser();
    const expected = {
      errorMessage: "User with this email already exists",
    };

    // Act
    await registerPage.goto();
    await registerPage.register(user);
    await registerPage.successToast.waitFor({ state: "visible" });
    await registerPage.goto();
    await registerPage.register(user);

    // Assert
    await expect(registerPage.errorToast).toBeVisible();
    await expect(registerPage.errorToast).toHaveText(expected.errorMessage);
    await expect(page).toHaveURL(/\/register\.html$/);

    await page.close();
  },
);

test(
  "registering with an invalid email format fails",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    // Arrange
    const registerPage = new RegisterPage(page);
    const user = createTestUser({ email: "not-an-email" });
    const expected = {
      validationMessage:
        "Please include an '@' in the email address. 'not-an-email' is missing an '@'.",
    };

    // Act
    await registerPage.goto();
    await registerPage.register(user);

    // Assert
    await expect(page).toHaveURL(/\/register\.html$/);
    await expect(registerPage.successToast).toBeHidden();
    await expect(registerPage.emailInput).toHaveJSProperty(
      "validity.valid",
      false,
    );
    await expect(registerPage.emailInput).toHaveJSProperty(
      "validationMessage",
      expected.validationMessage,
    );

    await page.close();
  },
);

test(
  "registering with a too-short password fails",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    // Arrange
    const registerPage = new RegisterPage(page);
    const user = createTestUser({ password: "ab" });
    const expected = {
      validationMessage:
        "Please lengthen this text to 3 characters or more (you are currently using 2 characters).",
    };

    // Act
    await registerPage.goto();
    await registerPage.register(user);

    // Assert
    await expect(page).toHaveURL(/\/register\.html$/);
    await expect(registerPage.successToast).toBeHidden();
    await expect(registerPage.passwordInput).toHaveJSProperty(
      "validity.valid",
      false,
    );
    await expect(registerPage.passwordInput).toHaveJSProperty(
      "validationMessage",
      expected.validationMessage,
    );

    await page.close();
  },
);

test(
  "registering with missing required fields fails",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    // Arrange
    const registerPage = new RegisterPage(page);
    const expected = {
      validationMessage: "Please fill out this field.",
    };

    // Act
    await registerPage.goto();
    await registerPage.submitButton.click();

    // Assert
    await expect(page).toHaveURL(/\/register\.html$/);
    await expect(registerPage.successToast).toBeHidden();
    await expect(registerPage.emailInput).toHaveJSProperty(
      "validity.valid",
      false,
    );
    await expect(registerPage.emailInput).toHaveJSProperty(
      "validationMessage",
      expected.validationMessage,
    );

    await page.close();
  },
);

test(
  "documentation page loads and is visible",
  { tag: ["@docs"] },
  async ({ page }) => {
    // Arrange
    const docsPage = new DocsPage(page);
    const expected = {
      subtitle: "Rolnopol System Guide & API Reference",
    };

    // Act
    await docsPage.goto();

    // Assert
    await expect(docsPage.subtitle).toHaveText(expected.subtitle);

    await page.close();
  },
);

test(
  "API explorer page loads and is visible",
  { tag: ["@docs"] },
  async ({ page }) => {
    // Arrange
    const swaggerPage = new SwaggerPage(page);
    const expected = {
      description:
        "API documentation for the Rolnopol service with versioning support",
    };

    // Act
    await swaggerPage.goto();

    // Assert
    await expect(swaggerPage.description).toHaveText(expected.description);

    await page.close();
  },
);
