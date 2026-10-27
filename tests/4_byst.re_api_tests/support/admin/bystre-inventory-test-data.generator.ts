import { randomUUID } from "node:crypto";

import type { InventoryAdjustmentInput } from "./bystre-admin-api.models";

export class BystreInventoryTestDataGenerator {
  static adjustment(
    overrides: Partial<InventoryAdjustmentInput> = {},
  ): InventoryAdjustmentInput {
    return {
      delta: 1,
      reason: "API inventory test adjustment",
      requestId: randomUUID(),
      ...overrides,
    };
  }
}
