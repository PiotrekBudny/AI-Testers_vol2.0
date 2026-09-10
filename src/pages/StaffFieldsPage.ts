import type { Locator, Page } from "@playwright/test";
import type { AnimalFormData } from "../models/Animal";
import type { FieldFormData } from "../models/Field";
import { BasePage } from "./BasePage";
import { PageUrls } from "./urls";

export class StaffFieldsPage extends BasePage {
  protected readonly url = PageUrls.staffFieldsMain;

  readonly addFieldTriggerButton: Locator;
  readonly fieldNameInput: Locator;
  readonly districtSelect: Locator;
  readonly areaInput: Locator;
  readonly modalHeading: Locator;
  readonly successMessage: Locator;
  readonly fieldSearchInput: Locator;

  readonly addAnimalTriggerButton: Locator;
  readonly animalModalHeading: Locator;
  readonly animalTypeSelect: Locator;
  readonly animalAmountInput: Locator;
  readonly animalFieldSelect: Locator;
  readonly animalSearchInput: Locator;

  constructor(page: Page) {
    super(page);

    this.addFieldTriggerButton = page
      .getByRole("button", { name: /add field/i })
      .first();
    this.fieldNameInput = page.getByRole("textbox", { name: /field name/i });
    this.districtSelect = page.getByRole("combobox", { name: /district/i });
    this.areaInput = page.getByRole("spinbutton", { name: /area/i });
    this.modalHeading = page.getByRole("heading", {
      name: /add field/i,
      level: 3,
    });
    this.successMessage = page.getByText("Field added!");
    this.fieldSearchInput = page.getByRole("textbox", {
      name: /search fields/i,
    });

    this.addAnimalTriggerButton = page
      .getByRole("button", { name: /add animal/i })
      .first();
    this.animalModalHeading = page.getByRole("heading", {
      name: /add animal/i,
      level: 3,
    });
    this.animalTypeSelect = page.getByRole("combobox", { name: /type/i });
    this.animalAmountInput = page.getByRole("spinbutton", {
      name: /amount/i,
    });
    this.animalFieldSelect = page.getByRole("combobox", {
      name: /field \(optional\)/i,
    });
    this.animalSearchInput = page.getByRole("textbox", {
      name: /search animals/i,
    });
  }

  async clickAddFieldButton(): Promise<void> {
    await this.addFieldTriggerButton.click();
    await this.modalHeading.waitFor({ state: "visible" });
  }

  async fillForm(field: FieldFormData): Promise<void> {
    await this.fieldNameInput.fill(field.name);
    if (field.district) {
      await this.districtSelect.selectOption(field.district, {
        timeout: 10_000,
      });
    }
    await this.areaInput.fill(field.area.toString());
  }

  async submitForm(): Promise<void> {
    // Submit button shares its accessible name with the trigger button, so target the last match
    const buttons = await this.page
      .getByRole("button", { name: /add field/i })
      .all();
    await buttons[buttons.length - 1].click();
  }

  async searchFields(query: string): Promise<void> {
    await this.fieldSearchInput.fill(query);
  }

  fieldResult(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  async clickAddAnimalButton(): Promise<void> {
    await this.addAnimalTriggerButton.click();
    await this.animalModalHeading.waitFor({ state: "visible" });
  }

  async fillAnimalForm(animal: AnimalFormData): Promise<void> {
    await this.animalTypeSelect.selectOption(animal.type, { timeout: 10_000 });
    await this.animalAmountInput.fill(animal.amount.toString());
    if (animal.field) {
      await this.animalFieldSelect.selectOption(animal.field, {
        timeout: 10_000,
      });
    }
  }

  async submitAnimalForm(): Promise<void> {
    // Submit button shares its accessible name with the trigger button, so target the last match
    const buttons = await this.page
      .getByRole("button", { name: /add animal/i })
      .all();
    await buttons[buttons.length - 1].click();
  }

  animalResult(animal: AnimalFormData): Locator {
    return this.page.locator(
      `[title="Amount of ${animal.type}: ${animal.amount}"]`,
    );
  }

  async searchAnimals(query: string): Promise<void> {
    await this.animalSearchInput.fill(query);
  }
}
