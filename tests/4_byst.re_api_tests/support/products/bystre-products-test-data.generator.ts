import { randomUUID } from "node:crypto";

import type { ProductInput } from "./bystre-products-api.models";

export class BystreProductsTestDataGenerator {
  static productInput(overrides: Partial<ProductInput> = {}): ProductInput {
    return {
      name: `API product ${randomUUID()}`,
      description: "Isolated API test product",
      price: 12.34,
      stockQuantity: 3,
      category: "API tests",
      imageUrl: "https://example.com/api-test.png",
      ...overrides,
    };
  }
}
