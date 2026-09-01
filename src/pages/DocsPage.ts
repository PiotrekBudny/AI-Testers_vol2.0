import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { PageUrls } from "./urls";

export class DocsPage extends BasePage {
  protected readonly url = PageUrls.docs;
  readonly subtitle: Locator;

  constructor(page: Page) {
    super(page);
    this.subtitle = page.locator(".docs-header-subtitle");
  }
}
