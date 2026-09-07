import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { PageUrls } from "./urls";

export class ProfilePage extends BasePage {
  protected readonly url = PageUrls.profile;
  readonly profileInformationHeading: Locator;
  readonly updateProfileHeading: Locator;
  readonly dangerZoneHeading: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.profileInformationHeading = page.getByRole("heading", {
      name: /Profile Information/i,
      level: 3,
    });
    this.updateProfileHeading = page.getByRole("heading", {
      name: /Update Profile/i,
      level: 3,
    });
    this.dangerZoneHeading = page.getByRole("heading", {
      name: /Danger Zone/i,
      level: 3,
    });
    this.logoutButton = page
      .getByTestId("header-component")
      .getByTestId("logout-btn");
  }

  async logout() {
    await this.logoutButton.click();
  }
}
