import { expect, test } from "@playwright/test";

import { StaffFieldsPage } from "../../src/pages/StaffFieldsPage";

/**
 * Tests for Staff & Fields Management - Field and Animal operations.
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

test(
  "User can find a newly added field in the search bar by its name",
  { tag: ["@farm"] },
  async ({ page }) => {
    test.setTimeout(15_000);

    // Arrange
    const staffFieldsPage = new StaffFieldsPage(page);
    const testField = { name: `SearchField-${Date.now()}`, area: 20 };

    // Act
    await staffFieldsPage.goto();
    await staffFieldsPage.clickAddFieldButton();
    await staffFieldsPage.fillForm(testField);
    await staffFieldsPage.submitForm();
    await expect(staffFieldsPage.successMessage).toBeVisible({
      timeout: 10_000,
    });
    await staffFieldsPage.searchFields(testField.name);

    // Assert
    await expect(staffFieldsPage.fieldResult(testField.name)).toBeVisible({
      timeout: 10_000,
    });

    await page.close();
  },
);

test(
  "User can add a new animal herd with valid data",
  { tag: ["@farm"] },
  async ({ page }) => {
    test.setTimeout(15_000);

    // Arrange
    const staffFieldsPage = new StaffFieldsPage(page);
    const testAnimal = { type: "goat", amount: (Date.now() % 9_000_000) + 1 };

    // Act
    await staffFieldsPage.goto();
    await staffFieldsPage.clickAddAnimalButton();
    await staffFieldsPage.fillAnimalForm(testAnimal);
    await staffFieldsPage.submitAnimalForm();

    // Assert
    await expect(staffFieldsPage.animalModalHeading).toBeHidden({
      timeout: 10_000,
    });

    await page.close();
  },
);

test(
  "User can find a newly added animal herd in the search bar by its type",
  { tag: ["@farm"] },
  async ({ page }) => {
    test.setTimeout(15_000);

    // Arrange
    const staffFieldsPage = new StaffFieldsPage(page);
    const testAnimal = { type: "sheep", amount: (Date.now() % 9_000_000) + 1 };

    // Act
    await staffFieldsPage.goto();
    await staffFieldsPage.clickAddAnimalButton();
    await staffFieldsPage.fillAnimalForm(testAnimal);
    await staffFieldsPage.submitAnimalForm();
    await expect(staffFieldsPage.animalModalHeading).toBeHidden({
      timeout: 10_000,
    });
    await staffFieldsPage.searchAnimals(testAnimal.type);

    // Assert
    await expect(staffFieldsPage.animalResult(testAnimal)).toBeVisible({
      timeout: 10_000,
    });

    await page.close();
  },
);
