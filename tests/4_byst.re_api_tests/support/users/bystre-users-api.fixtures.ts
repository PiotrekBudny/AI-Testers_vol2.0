import { test as base } from "@playwright/test";

import {
  deleteBystreUser,
  requireBystreStatus,
  signInBystreUser,
} from "./bystre-user-lifecycle";
import { BystreUsersApiClient } from "./bystre-users-api.client";
import type {
  BystreAuthenticatedUser,
  BystreSignupRequest,
} from "./bystre-users-api.models";
import { BystreTestDataGenerator } from "./bystre-users-test-data.generator";

export { expect } from "@playwright/test";

interface BystreUsersApiFixtures {
  bystreUsersApi: BystreUsersApiClient;
  userCleanup: (user: Readonly<BystreSignupRequest>, token?: string) => void;
  authenticatedUser: BystreAuthenticatedUser;
  secondAuthenticatedUser: BystreAuthenticatedUser;
}

export const test = base.extend<BystreUsersApiFixtures>({
  secondAuthenticatedUser: async (
    { bystreUsersApi, userCleanup },
    use,
  ): Promise<void> => {
    const user = Object.freeze(BystreTestDataGenerator.signupRequest());
    await requireBystreStatus(
      bystreUsersApi.signup(user),
      "second user signup",
      201,
    );
    userCleanup(user);
    const token = await signInBystreUser(bystreUsersApi, user);
    userCleanup(user, token);
    await use({ user, token });
  },
  bystreUsersApi: async ({ request }, use): Promise<void> => {
    await use(new BystreUsersApiClient(request));
  },

  userCleanup: [
    async ({ bystreUsersApi }, use): Promise<void> => {
      const users = new Map<
        string,
        { user: Readonly<BystreSignupRequest>; token?: string }
      >();
      await use((user, token) => {
        // Track only confirmed registrations; copy credentials before tests mutate them.
        users.set(user.username, {
          user: Object.freeze({ ...user }),
          token: token ?? users.get(user.username)?.token,
        });
      });
      const failures: string[] = [];
      for (const { user, token } of users.values()) {
        try {
          await deleteBystreUser(bystreUsersApi, user, token);
        } catch (error) {
          // Lifecycle helpers expose only sanitized errors, never response bodies.
          const reason =
            error instanceof Error ? error.message : "Cleanup failed.";
          failures.push(`Account ${user.username}: ${reason}`);
        }
      }
      if (failures.length) {
        throw new Error(`Bystre user cleanup failed:\n${failures.join("\n")}`);
      }
    },
    { timeout: 30_000 },
  ],

  authenticatedUser: [
    async ({ bystreUsersApi, userCleanup }, use): Promise<void> => {
      const user = Object.freeze(BystreTestDataGenerator.signupRequest());
      await requireBystreStatus(
        bystreUsersApi.signup(user),
        "signup (POST /api/v1/users/signup)",
        201,
      );
      userCleanup(user);

      const token = await signInBystreUser(bystreUsersApi, user);
      userCleanup(user, token);
      await use({ user, token });
    },
    { timeout: 30_000 },
  ],
});
