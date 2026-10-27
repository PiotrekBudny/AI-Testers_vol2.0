import type { AddressInput } from "./bystre-orders-api.models";

export class BystreOrdersTestDataGenerator {
  static shippingAddress(overrides: Partial<AddressInput> = {}): AddressInput {
    return {
      street: "123 Test Street",
      city: "Warsaw",
      state: "Mazowieckie",
      zipCode: "00-001",
      country: "Poland",
      ...overrides,
    };
  }
}
