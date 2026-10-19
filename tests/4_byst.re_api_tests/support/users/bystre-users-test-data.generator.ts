import { randomInt, randomUUID } from "node:crypto";

import type { BystreSignupRequest } from "./bystre-users-api.models";

const firstNames = ["Clara", "Nolan", "Lucia"];
const lastNames = ["Miller", "Turner", "Brooks"];

export class BystreTestDataGenerator {
  static signupRequest(): BystreSignupRequest {
    const uniqueId = randomUUID().replaceAll("-", "");

    return {
      username: `bystre_${uniqueId}`,
      email: `bystre.${uniqueId}@example.com`,
      password: `Bystre-${randomUUID()}`,
      firstName: firstNames[randomInt(firstNames.length)],
      lastName: lastNames[randomInt(lastNames.length)],
    };
  }
}
