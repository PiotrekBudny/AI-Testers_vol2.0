import type { Page } from "@playwright/test";

export abstract class BasePage {
  protected abstract readonly url: string;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.url);
  }
}
