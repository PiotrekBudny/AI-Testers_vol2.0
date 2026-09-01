import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DocsPage extends BasePage {
  protected readonly url = "/docs.html";
  readonly subtitle: Locator;

  constructor(page: Page) {
    super(page);
    this.subtitle = page.locator(".docs-header-subtitle");
  }
}
