import { expect, test } from "@playwright/test";

test(
  "intentionally fails to verify CI uploads reports on failure",
  { tag: ["@pipeline-check"] },
  async () => {
    // Arrange
    const expected = "success";

    // Act
    const actual = "failure";

    // Assert
    expect(actual).toBe(expected);
  },
);
