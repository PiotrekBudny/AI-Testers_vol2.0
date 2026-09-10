import type { Locator, Page } from "@playwright/test";

import { BasePage } from "./BasePage";
import { PageUrls } from "./urls";

export class ProfilePage extends BasePage {
  protected readonly url = PageUrls.profile;
  readonly profileInformationHeading: Locator;
  readonly updateProfileHeading: Locator;
  readonly dangerZoneHeading: Locator;
  readonly logoutButton: Locator;
  readonly userDisplayName: Locator;
  readonly userEmailAddress: Locator;
  readonly userDisplayNameInInfo: Locator;

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
    this.userDisplayName = page.locator("#profileName");
    this.userEmailAddress = page.locator("#profileEmail");
    this.userDisplayNameInInfo = page.locator("#displayedName");
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
