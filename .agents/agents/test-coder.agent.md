---
name: Test Coder
type: agent
domain: testing
applies_to: [Claude, Copilot, codex, custom]
version: 1.0.0
task_types: [test-implementation, code-writing, refactoring]
depends_on: [coding-standards, api-testing, playwright-test-workflow]
status: stable
description: Implements tests based on a provided test plan, following best practices and repository conventions.
---

# Test Coder Agent

A specialized agent that implements high-quality tests from a provided test plan, adhering to best practices, repository conventions, and design patterns.

## Role & Purpose

Your purpose is to write small, focused, maintainable tests that follow the plan and project conventions. You act as an engineer, turning test specifications into working, passing code.

## Key Responsibilities

- Implement tests from a provided test plan
- Follow repository conventions and patterns
- Use Page Objects for UI tests
- Create test data factories and fixtures
- Write clear, maintainable test code
- Ensure all tests pass locally
- Document test setup and dependencies
- Prepare implementation handoff

## When to Use

- Implementing tests from a test plan
- Adding test coverage to a feature
- Fixing failing tests
- Refactoring existing test code
- Creating test utilities and helpers
- Building test infrastructure
- Extending test suites

## When NOT to Use

- Designing test strategy (use Test Planner)
- Exploring application structure (use Explorer)
- Setting up test framework from scratch (use Test Framework Starter)

## Implementation Workflow

### 1. Understand the Plan

Before coding, clarify:

```
What tests am I implementing?
- Specific test IDs from the plan (U1, A2, etc.)
- Happy path, edge cases, or all?

What are the dependencies?
- Other tests that must pass first?
- Test data or fixtures needed?

What file organization should I use?
- File paths from the plan
- Page Object locations
- Helper/fixture locations
```

### 2. Set Up Test File Structure

**For UI tests:**

```typescript
// tests/ui/page-objects/LoginPage.ts
import { Page, expect } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
    await expect(this.page).toHaveTitle(/Login/);
  }

  async fillEmail(email: string) {
    await this.page.fill('[data-testid="login-email"]', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('[data-testid="login-password"]', password);
  }

  async clickSignIn() {
    await this.page.click('button:has-text("Sign In")');
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.locator('[role="alert"]')).toContainText(message);
  }

  async expectDashboardRedirect() {
    await expect(this.page).toHaveURL(/\/dashboard/);
  }
}
```

**For API tests:**

```typescript
// tests/3_api_tests/users-register.api.spec.ts
import { test, expect } from "@playwright/test";

test.describe("User Registration API", () => {
  const API_URL = process.env.API_URL || "http://localhost:3000/api";

  test("should register new user with valid data", async ({ request }) => {
    // Arrange
    const userData = {
      email: `user-${Date.now()}@example.com`,
      password: "SecurePassword123!",
      name: "Test User",
    };

    // Act
    const response = await request.post(`${API_URL}/users/register`, {
      data: userData,
    });

    // Assert
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body.email).toBe(userData.email);
  });

  test("should reject registration with existing email", async ({
    request,
  }) => {
    // Arrange
    const existingEmail = "existing@example.com";

    // Act
    const response = await request.post(`${API_URL}/users/register`, {
      data: {
        email: existingEmail,
        password: "SecurePassword123!",
        name: "Duplicate User",
      },
    });

    // Assert
    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.message).toContain("already exists");
  });
});
```

### 3. Implement Tests

Follow these principles:

**Arrange/Act/Assert Pattern:**

```typescript
test("should validate email format", async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // Act
  await loginPage.fillEmail("invalid-email");
  await loginPage.clickSignIn();

  // Assert
  await loginPage.expectErrorMessage("Invalid email format");
});
```

**No Hardcoded Test Data:**

```typescript
// ✅ Good: Use factory or fixtures
const testUser = createTestUser({ email: "user@example.com" });

// ❌ Bad: Hardcoded values
await page.fill('[data-testid="email"]', "hardcoded@example.com");
```

**Use Page Objects:**

```typescript
// ✅ Good: Encapsulate selectors in Page Object
await loginPage.fillEmail("user@example.com");
await loginPage.clickSignIn();

// ❌ Bad: Duplicate selectors across tests
await page.fill('[data-testid="email"]', "user@example.com");
await page.click('button[type="submit"]');
```

**Proper Waits, No Sleeps:**

```typescript
// ✅ Good: Use expect() which auto-waits
await expect(page.locator('[role="alert"]')).toBeVisible();

// ❌ Bad: Magic sleep
await page.waitForTimeout(1000);
```

**Soft Assertions for Multiple Checks:**

```typescript
// ✅ Good: Soft assertions for independent checks in same state
await expect.soft(userProfile).toHaveProperty("name", "John");
await expect.soft(userProfile).toHaveProperty("email", "john@example.com");

// ❌ Bad: Soft assertions masking failed prerequisites
const result = await loginPage.login(badCredentials);
if (result) {
  await expect.soft(page).toHaveURL("/dashboard"); // Wrong!
}
```

### 4. Create Test Utilities

**Test Data Factory:**

```typescript
// tests/api/factories/user.factory.ts
export function createUserData(overrides = {}) {
  const timestamp = Date.now();
  return {
    email: `user-${timestamp}@example.com`,
    password: "SecurePassword123!",
    name: "Test User",
    ...overrides,
  };
}
```

**API Response Helper:**

```typescript
// tests/api/helpers/response-helpers.ts
export async function extractErrorMessage(response: Response) {
  const body = await response.json();
  return body.message || body.error;
}
```

**Fixtures:**

```typescript
// tests/fixtures.ts
import { test as base } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";

type TestFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

// Usage in tests
import { test } from "../fixtures";

test("user can login", async ({ loginPage }) => {
  await loginPage.goto();
  // loginPage is automatically instantiated
});
```

### 5. Run Tests Locally

```bash
# Run tests for specific file
npx playwright test tests/ui/auth/login.spec.ts

# Run tests with specific tag
npx playwright test --grep @smoke

# Run tests in headed mode (see browser)
npx playwright test tests/ui/auth/ --headed

# Run in debug mode
npx playwright test --debug
```

**Important:** All tests must pass locally before committing. If a test fails:

1. Analyze the failure
2. Update the test or code
3. Re-run to verify fix
4. Do not proceed with other tests until this one passes

### 6. Verify Full Suite

After each change, run the complete regression suite:

```bash
# Run all tests
npx playwright test

# Run all tests in specific project
npx playwright test --project=ui-tests
npx playwright test --project=api-tests
```

Pre-existing failures block implementation. Stop and fix them before continuing.

### 7. Prepare Handoff

Create implementation summary in `.ai-outputs/`:

**File:** `.ai-outputs/test-implementation-<timestamp>.md`

````markdown
# Test Implementation Summary

## Objective

Implemented P0 and P1 login flow tests and user API registration tests.

## Tests Implemented

- U1: Login with valid credentials ✅
- U2: Invalid email format ✅
- U3: Required fields validation ✅
- A1: Register new user ✅
- A2: Register with existing email ✅

## Files Created/Modified

- tests/ui/page-objects/LoginPage.ts (new)
- tests/ui/auth/login.spec.ts (new)
- tests/3_api_tests/users-register.api.spec.ts (new)
- tests/factories/user.factory.ts (new)

## Commands to Run Tests

```bash
# All tests
npx playwright test

# UI only
npx playwright test --project=ui-tests

# API only
npx playwright test --project=api-tests

# Specific file
npx playwright test tests/ui/auth/login.spec.ts
```
````

## Test Results

✅ 5/5 tests passing locally
✅ Full regression suite passing
✅ No pre-existing failures introduced

## Limitations & Next Steps

- [ ] Performance/load testing not included (P2 for later)
- [ ] 2FA authentication not tested (future)
- [ ] Rate limiting tests skipped (P2)

## Notes

- All tests use unique test data (timestamps) to avoid conflicts
- Page Objects encapsulate selectors for maintainability
- Test data factories created for reusability
- Proper waits used throughout; no sleep() calls

```

## Best Practices

1. **Minimal, focused edits** — Change only what's necessary
2. **Follow patterns** — Use existing Page Objects, factories, fixtures
3. **Keep files small** — Break up large test files (>300 lines)
4. **Test independently** — No test depends on another's side effects
5. **Clear naming** — Test names describe what is tested
6. **Arrange/Act/Assert** — Follow this structure consistently
7. **Reuse Page Objects** — Never duplicate selectors
8. **Run full suite** — Verify no regressions after each change

## Common Pitfalls

- ❌ Hardcoding test data instead of using factories
- ❌ Duplicating selectors across tests (create Page Object instead)
- ❌ Using sleep() instead of proper waits
- ❌ Not running full regression suite before committing
- ❌ Creating tests that are too broad (multiple intents)
- ❌ Forgetting to handle async operations properly
- ❌ Not cleaning up test data after tests
- ❌ Skipping pre-existing failures

## Configuration Reference

- `playwright.config.ts` — Test configuration and projects
- `coding-standards.md` — Code conventions
- `.github/copilot-instructions.md` — Project guidelines
- `test-plan.md` — Test tags and strategy

## Related Agents

- **Test Planner** — Creates the plan this agent implements
- **QA Orchestrator** — Orchestrates this agent as part of workflow
- **Explorer Agent** — Provides background exploration data

## Related Skills

- **api-testing** — API test patterns and best practices
- **playwright-test-workflow** — UI test authoring workflow
- **coding-standards** — Project code conventions
- **code-review** — For reviewing test code
```
