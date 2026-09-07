import type { Locator, Page } from "@playwright/test";
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

  constructor(page: Page) {
    super(page);

    this.addFieldTriggerButton = page
      .getByRole("button", { name: /\+ add field/i })
      .first();
    this.fieldNameInput = page.getByRole("textbox", { name: /field name/i });
    this.districtSelect = page.getByRole("combobox", { name: /district/i });
    this.areaInput = page.getByRole("spinbutton", { name: /area/i });
    this.modalHeading = page.getByRole("heading", {
      name: /add field/i,
      level: 3,
    });
    this.successMessage = page.getByText("Field added!");
  }

  async clickAddFieldButton() {
    await this.addFieldTriggerButton.click();
    await this.modalHeading.waitFor({ state: "visible" });
  }

  async fillForm(field: FieldFormData) {
    await this.fieldNameInput.fill(field.name);
    if (field.district) {
      await this.districtSelect.selectOption(field.district, {
        timeout: 10_000,
      });
    }
    await this.areaInput.fill(field.area.toString());
  }

  async submitForm() {
    // Submit button shares its accessible name with the trigger button, so target the last match
    const buttons = await this.page
      .getByRole("button", { name: /\+ add field/i })
      .all();
    await buttons[buttons.length - 1].click();
  }
}
