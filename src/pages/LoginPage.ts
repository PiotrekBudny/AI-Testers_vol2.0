import type { Locator, Page } from "@playwright/test";
import type { LoginCredentials } from "../models/User";
import { BasePage } from "./BasePage";
import { PageUrls } from "./urls";

export class LoginPage extends BasePage {
  protected readonly url = PageUrls.login;
  readonly subtitle: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.subtitle = page.getByTestId("login-subtitle");
    this.emailInput = page.getByTestId("email-input");
    this.passwordInput = page.getByTestId("password-input");
    this.submitButton = page.getByTestId("login-submit-btn");
  }

  async login(credentials: LoginCredentials) {
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
    await this.submitButton.click();
  }
}
