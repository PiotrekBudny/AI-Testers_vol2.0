import { expect, test } from "@playwright/test";
import { StaffFieldsPage } from "../../src/pages/StaffFieldsPage";

/**
 * Tests for Staff & Fields Management - Field operations.
 * These tests depend on the setup project that handles authentication.
 * Authentication state is automatically loaded from playwright/.auth/user.json.
 
 */

test(
  "User can add a new field with valid data",
  { tag: ["@farm", "@smoke"] },
  async ({ page }) => {
    test.setTimeout(15_000);

    // Arrange
    const staffFieldsPage = new StaffFieldsPage(page);
    const testField = { name: `TestField-${Date.now()}`, area: 25 };

    // Act
    await staffFieldsPage.goto();
    await staffFieldsPage.clickAddFieldButton();
    await staffFieldsPage.fillForm(testField);
    await staffFieldsPage.submitForm();

    // Assert
    await expect(staffFieldsPage.modalHeading).toBeHidden({ timeout: 10_000 });
    await expect(staffFieldsPage.successMessage).toBeVisible({
      timeout: 10_000,
    });

    await page.close();
  },
);
