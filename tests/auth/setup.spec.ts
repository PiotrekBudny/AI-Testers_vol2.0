import { test as setup } from "@playwright/test";
import { LoginPage } from "../../src/pages/LoginPage";
import { existingUsers } from "../../src/test-data/users";

setup(
  "authenticate DEMO_USER and save session state",
  { tag: ["@setup"] },
  async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const demoUser = existingUsers.demoUser;

    // Act
    await loginPage.goto();
    await loginPage.login(demoUser);

    // Wait for navigation after successful login
    // The application redirects to profile.html after successful login
    await page.waitForURL(/\/profile\.html$/, { timeout: 8000 });

    // Assert - verify we're logged in by checking for profile link or user indicator
    // Save authentication state
    await page.context().storageState({ path: "playwright/.auth/user.json" });
  },
);
