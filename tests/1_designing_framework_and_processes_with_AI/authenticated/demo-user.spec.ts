import { expect, test } from "@playwright/test";

import { config } from "../../../src/config/environment";
import { LoginPage } from "../../../src/pages/LoginPage";
import { ProfilePage } from "../../../src/pages/ProfilePage";
import { existingUsers } from "../../../src/test-data/users";

test(
  "authenticated user can access profile page",
  { tag: ["@authenticated", "@profile"] },
  async ({ page }) => {
    // Arrange
    const profilePage = new ProfilePage(page);
    const expected = {
      profileTitle: "Profile - Rolnopol",
    };

    // Act
    await page.goto("/profile.html");

    // Assert
    await expect(page).toHaveURL(/\/profile\.html$/);
    await expect(page).toHaveTitle(expected.profileTitle);
    await expect(profilePage.profileInformationHeading).toBeVisible();
    await expect(profilePage.updateProfileHeading).toBeVisible();
    await expect(profilePage.dangerZoneHeading).toBeVisible();

    await page.close();
  },
);

test(
  "authenticated user profile displays correct user email and display name",
  { tag: ["@authenticated", "@profile"] },
  async ({ page }) => {
    // Arrange
    const profilePage = new ProfilePage(page);
    const expected = {
      displayName: config.DEMO_USER_DISPLAY_NAME,
      email: config.DEMO_USER_EMAIL,
    };

    // Act
    await page.goto("/profile.html");

    // Assert
    await expect(page).toHaveURL(/\/profile\.html$/);
    await expect(profilePage.userDisplayName).toHaveText(expected.displayName);
    await expect(profilePage.userEmailAddress).toHaveText(expected.email);
    await expect(profilePage.userDisplayNameInInfo).toHaveText(
      expected.displayName,
    );

    await page.close();
  },
);

test.describe("logout", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    "authenticated user can logout and redirect to home page",
    { tag: ["@authenticated", "@profile"] },
    async ({ page }) => {
      test.setTimeout(15_000);

      // Arrange
      const loginPage = new LoginPage(page);
      const profilePage = new ProfilePage(page);
      const expected = {
        homeTitle: "Rolnopol",
      };

      // Act
      await loginPage.goto();
      await loginPage.login(existingUsers.demoUser);
      await page.waitForURL(/\/profile\.html$/, { timeout: 8000 });
      await profilePage.logout();

      // Assert
      await expect(page).toHaveURL(/\/$/, { timeout: 8000 });
      await expect(page).toHaveTitle(expected.homeTitle);

      await page.close();
    },
  );
});
