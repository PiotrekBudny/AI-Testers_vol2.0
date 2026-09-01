import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { PageUrls } from "./urls";

export class LoginPage extends BasePage {
  protected readonly url = PageUrls.login;
  readonly subtitle: Locator;

  constructor(page: Page) {
    super(page);
    this.subtitle = page.getByTestId("login-subtitle");
  }
}
