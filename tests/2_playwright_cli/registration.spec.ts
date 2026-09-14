import { expect, test } from "@playwright/test";

import { RegisterPage } from "../../src/pages/RegisterPage";
import { createTestUser } from "../../src/test-data/users";

test(
  "user can successfully register with valid credentials",
  { tag: ["@registration", "@happy-path"] },
  async ({ page }) => {
    // Arrange
    const registerPage = new RegisterPage(page);
    const newUser = createTestUser();

    // Act
    await registerPage.goto();
    await registerPage.register(newUser);

    // Assert
    await expect(registerPage.successToast).toBeVisible();
  },
);
