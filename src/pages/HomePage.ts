import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { PageUrls } from "./urls";

export class HomePage extends BasePage {
  protected readonly url = PageUrls.home;
  readonly getStartedLink: Locator;

  constructor(page: Page) {
    super(page);
    this.getStartedLink = page.getByRole("link", { name: "Get Started Free" });
  }

  async clickGetStarted() {
    await this.getStartedLink.click();
  }
}
