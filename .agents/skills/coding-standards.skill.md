---
name: "Coding Standards & Conventions Skill"
type: "skill"
domain: "code"
applies_to: ["claude", "copilot", "codex", "custom"]
version: "1.0"
task_types: ["coding", "test_implementation", "code_review"]
status: "stable"
---

# Coding Standards & Conventions Skill

This skill documents the coding conventions, architectural patterns, and organizational standards for the AI-Testers project. Use this when writing code, tests, or reviewing contributions.

## When to Use

- Writing test code (API, UI, or integration tests)
- Creating page objects or test helpers
- Organizing test files and support structures
- Reviewing code for compliance with standards
- Refactoring existing code to follow conventions
- Setting up new test modules or suites

## Core Concepts

### 1. Page Objects (`src/pages/`)

Page objects encapsulate UI interaction logic and separate it from test assertions.

**Structure:**

```typescript
// One class per page, named <Page>Page
export class RegisterPage extends BasePage {
  protected readonly url = PageUrls.register;

  readonly firstNameInput = this.page.getByTestId("firstName");
  readonly lastNameInput = this.page.getByTestId("lastName");
  readonly emailInput = this.page.getByTestId("email");
  readonly passwordInput = this.page.getByTestId("password");
  readonly submitButton = this.page.getByRole("button", { name: "Register" });
  readonly successToast = this.page.getByRole("status");

  constructor(page: Page) {
    super(page);
  }

  async register(user: User): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
  }
}
```

**Rules:**

- ✅ Extend `BasePage` (which holds shared `page` field and `goto()` method)
- ✅ Declare page URL as `protected readonly url` from `PageUrls`
- ✅ Store locators as `readonly` fields, initialized in constructor
- ✅ Prefer `page.getByTestId(...)` over role/text/class locators
- ✅ Provide action methods (e.g., `register()`) that perform steps
- ✅ Expose locators needed for assertions (e.g., `successToast`)
- ✅ Use one method per form/flow with params object over many single-field methods

**No-Nos:**

- ❌ **No assertions in page objects** — all `expect()` calls stay in tests
- ❌ Don't create single-field setter methods (e.g., `setFirstName()`, `setLastName()`)
- ❌ Don't make page objects aware of test flow or outcome

**Locator Priority:**

1. `getByTestId()` — most reliable (added by developers)
2. `getByRole()` — semantic and resilient
3. `getByText()` / `getByLabel()` — user-facing text
4. CSS/XPath selectors — last resort

### 2. API Client Abstractions

API clients encapsulate endpoint logic, URL management, and headers.

**Structure:**

```typescript
export class BystreUsersApiClient {
  private readonly baseUrl = config.BYSTRE_API_BASE_URL;

  constructor(private request: APIRequestContext) {}

  async login(credentials: LoginPayload): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/users/login`, {
      data: credentials,
    });
  }

  async getMe(token: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
```

**Rules:**

- ✅ One client per resource/module
- ✅ Centralize URL building and header management
- ✅ Return raw `APIResponse` (let caller parse and assert)
- ✅ Use descriptive method names matching API semantics
- ✅ Accept parameters as objects, not individual args

**Benefits:**

- Reduced duplication across test files
- Easy to mock or stub endpoints
- Clear API contract documentation

### 3. Tests: Arrange/Act/Assert

All tests follow a strict three-section structure with mandatory comments.

**Structure:**

```typescript
test(
  "login succeeds with valid credentials",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const user = createTestUser();

    // Act
    await page.goto("/login");
    await loginPage.login(user);

    // Assert
    expect(loginPage.successToast).toBeVisible();
    expect(page).toHaveURL("/dashboard");
  },
);
```

**Sections:**

- **Arrange**: Set up test data, navigate, create page objects
- **Act**: Perform user actions or API calls
- **Assert**: Verify outcomes with `expect()` calls

**Rules:**

- ✅ Every test must have all three sections with comment markers
- ✅ All assertions go in Assert section
- ✅ Keep Arrange and Act focused (one-purpose each)
- ✅ Use clear assertion messages

**No-Nos:**

- ❌ Never put assertions in Arrange or Act sections
- ❌ Don't perform actions in Assert section
- ❌ Don't do setup in Act section

### 4. Test Tagging & Filtering

Tests use `@` tags to enable filtering and categorization.

**Tag Examples:**

```typescript
test(
  "creates a new product",
  { tag: ["@marketplace", "@crud", "@smoke"] },
  async ({ page }) => {
    // Test implementation
  },
);

test(
  "requires authentication",
  { tag: ["@auth", "@rbac"] },
  async ({ page }) => {
    // Test implementation
  },
);
```

**Common Tags:**

- `@smoke` — Critical path, fast-running tests (login, basic CRUD)
- `@auth` — Authentication/authorization tests
- `@farm`, `@marketplace`, `@finance` — Feature areas
- `@rbac` — Role-based access control
- `@e2e` — End-to-end workflows
- `@api` — API-focused tests
- `@bystre-credentials` — Requires external API credentials

**Tagging Rules:**

- ✅ Every test must have at least one tag
- ✅ Use `@smoke` only for critical tests
- ✅ Add feature/domain tags (e.g., `@marketplace`)
- ✅ Keep tags in `test-plan.md` as source of truth
- ✅ Use tags to filter: `--grep @smoke`, `--grep-invert @bystre-credentials`

**Adding New Tags:**

- First add to `test-plan.md` under `## Tags` section
- Then use in tests
- Document what the tag means

### 5. File and Folder Organization

Organized file structure makes projects scalable and maintainable.

**Tests:**

```
tests/
├── 1_designing_framework_and_processes_with_AI/
│   ├── auth/
│   │   └── setup.spec.ts
│   ├── authenticated/
│   │   ├── fields.spec.ts
│   │   └── demo-user.spec.ts
│   └── main.smoke.spec.ts
├── 2_playwright_cli/
│   └── *.spec.ts
├── 3_api_tests/
│   ├── api-test-helpers.ts
│   ├── login.api.spec.ts
│   └── *.api.spec.ts
└── 4_byst.re_api_tests/
    ├── support/
    └── *.api.spec.ts
```

**Source Code:**

```
src/
├── pages/
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   └── urls.ts
├── api/
│   ├── types/
│   ├── urls.ts
│   └── clients/
├── config/
│   └── environment.ts
├── models/
│   └── User.ts
└── test-data/
    └── users.ts
```

**Rules:**

- ✅ Spec files: `<name>.spec.ts` (single feature) or `<feature>.spec.ts` (related tests)
- ✅ API tests: `<endpoint>.api.spec.ts`
- ✅ Support files: `<name>.ts` (helpers, clients, fixtures)
- ✅ Page objects: `<Page>Page.ts`
- ✅ Models/types: `<Model>.ts`

### 6. Comments and Documentation

Comment only code that needs clarification. Don't comment obvious logic.

**Good Comments:**

```typescript
// Store auth token in localStorage so browser remembers login across page reloads
localStorage.setItem("authToken", token);

// Wait for all network requests to settle before asserting on final state
await page.waitForLoadState("networkidle");

// Regex allows both "error" and "err" in backend messages (API inconsistency)
expect(errorMsg).toMatch(/err/i);
```

**Bad Comments:**

```typescript
// Increment counter
counter++; // ❌ Obvious

// Navigate to home page
await page.goto("/"); // ❌ Code already clear

// Set firstName
firstName = "John"; // ❌ Variable name is clear
```

**Documentation:**

- Use JSDoc for functions and classes
- Explain WHY, not WHAT
- Link to related issues/tests

```typescript
/**
 * Registers a fresh user via a disposable request context.
 * Uses a new context so the test's shared `request` stays free of auth cookies,
 * which allows testing "invalid token" scenarios.
 */
export async function registerFreshUser(
  overrides: Partial<User> = {},
): Promise<{ user: User; token: string; userId: number }> {
  // Implementation
}
```

## Common Patterns

### Pattern 1: Helper Functions

Keep helper functions focused and reusable:

```typescript
// ✅ Good: Single responsibility, clear name
export async function createFieldForUser(
  request: APIRequestContext,
  token: string,
): Promise<number> {
  const field = await createOwnedField(request, token, {
    name: `Test Field ${randomUUID()}`,
    area: 10,
    district: "PL-MZ",
  });
  return field.id;
}

// ❌ Bad: Does too much, unclear purpose
export async function setupUserWithFieldAndStaff(
  request: APIRequestContext,
  pageIndex: number,
) {
  // Lots of unrelated setup...
}
```

### Pattern 2: Test Data Models

Create clear, type-safe test data:

```typescript
export interface User {
  email: string;
  password: string;
  displayName: string;
}

export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    email: `test-${randomUUID()}@example.com`,
    password: "SecurePassword123!",
    displayName: "Test User",
    ...overrides,
  };
}
```

### Pattern 3: Environment Configuration

Centralize config access:

```typescript
// src/config/environment.ts
export const config = {
  BASE_URL: process.env.BASE_URL || "http://localhost:3000",
  BYSTRE_API_BASE_URL:
    process.env.BYSTRE_API_BASE_URL || "https://awesome.byst.re",
  BYSTRE_API_USERNAME: process.env.BYSTRE_API_USERNAME,
  BYSTRE_API_PASSWORD: process.env.BYSTRE_API_PASSWORD,
  isCI: !!process.env.CI,
};
```

Use: `config.BASE_URL`, `config.isCI`, etc.

## Common Pitfalls

❌ **Don't:**

- Put assertions in page objects
- Create 10 single-field setter methods in page objects
- Hardcode test data or credentials
- Use absolute sleeps (`page.waitForTimeout()`)
- Create tests without Arrange/Act/Assert markers
- Put business logic in test files
- Mix different concerns in one helper
- Skip or ignore flaky tests (fix them!)

## References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Organizing Tests](https://playwright.dev/docs/best-practices#how-to-organize-tests)
