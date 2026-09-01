import type { FrameLocator, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { PageUrls } from "./urls";

export class SwaggerPage extends BasePage {
  protected readonly url = PageUrls.swagger;
  readonly frame: FrameLocator;
  readonly description: Locator;

  constructor(page: Page) {
    super(page);
    this.frame = page.frameLocator("iframe");
    this.description = this.frame.locator(".description");
  }
}
