import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { PageUrls } from "./urls";

export class RegisterPage extends BasePage {
  protected readonly url = PageUrls.register;
  readonly subtitle: Locator;
  readonly emailInput: Locator;
  readonly displayNameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.subtitle = page.getByTestId("register-subtitle");
    this.emailInput = page.getByTestId("email-input");
    this.displayNameInput = page.getByTestId("display-name-input");
    this.passwordInput = page.getByTestId("password-input");
    this.submitButton = page.getByTestId("register-submit-btn");
    this.successToast = page.getByText("Registration successful!", { exact: true });
  }

  async register(user: {
    email: string;
    displayName: string;
    password: string;
  }) {
    await this.emailInput.fill(user.email);
    await this.displayNameInput.fill(user.displayName);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
  }
}
