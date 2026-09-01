import type { FrameLocator, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SwaggerPage extends BasePage {
  protected readonly url = "/swagger.html";
  readonly frame: FrameLocator;
  readonly description: Locator;

  constructor(page: Page) {
    super(page);
    this.frame = page.frameLocator("iframe");
    this.description = this.frame.locator(".description");
  }
}
