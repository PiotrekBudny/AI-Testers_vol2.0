import { expect } from "@playwright/test";

import type { ProductDto, ProductInput } from "./bystre-products-api.models";

// Identity-generated product IDs are positive. Never target a shared product for mutation-denied tests.
export const missingProductId = -1;
export function expectProduct(product: ProductDto): void {
  expect(product).toMatchObject({
    id: expect.any(Number),
    name: expect.stringMatching(/\S+/),
    description: expect.any(String),
    price: expect.any(Number),
    stockQuantity: expect.any(Number),
    category: expect.any(String),
    createdAt: expect.stringMatching(
      /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?$/,
    ),
    updatedAt: expect.stringMatching(
      /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?$/,
    ),
  });
  expect(Number.isSafeInteger(product.id)).toBe(true);
  expect(product.id).toBeGreaterThan(0);
  expect(product.price).toBeGreaterThanOrEqual(0.01);
  expect(product.price).toBeLessThanOrEqual(99999999.99);
  expect(product.price * 100).toBeCloseTo(Math.round(product.price * 100), 5);
  expect(Number.isInteger(product.stockQuantity)).toBe(true);
  expect(product.stockQuantity).toBeGreaterThanOrEqual(0);
  expect(
    product.imageUrl === null || typeof product.imageUrl === "string",
  ).toBe(true);
  expect(Number.isFinite(Date.parse(product.createdAt))).toBe(true);
  expect(Number.isFinite(Date.parse(product.updatedAt))).toBe(true);
}
export const invalidProductFields: {
  label: string;
  field: keyof ProductInput;
  value: string | number;
}[] = [
  { label: "short name", field: "name", value: "ab" },
  { label: "long name", field: "name", value: "n".repeat(101) },
  { label: "long description", field: "description", value: "d".repeat(1001) },
  { label: "zero price", field: "price", value: 0 },
  { label: "negative price", field: "price", value: -1 },
  { label: "excess price precision", field: "price", value: 1.001 },
  { label: "price overflow", field: "price", value: 100000000 },
  { label: "negative stock", field: "stockQuantity", value: -1 },
  {
    label: "invalid image URL",
    field: "imageUrl",
    value: "ftp://example.com/product",
  },
];
