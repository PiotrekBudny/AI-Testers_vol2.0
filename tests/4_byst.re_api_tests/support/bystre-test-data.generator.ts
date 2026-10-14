import { randomUUID } from "node:crypto";

import type { BystreSignupRequest } from "./bystre-api.models";

export class BystreTestDataGenerator {
  static signupRequest(): BystreSignupRequest {
    const uniqueId = randomUUID().replaceAll("-", "");

    return {
      username: `bystre_${uniqueId}`,
      email: `bystre.${uniqueId}@example.com`,
      password: `Bystre-${uniqueId}`,
      firstName: "Test",
      lastName: "User",
    };
  }
}
