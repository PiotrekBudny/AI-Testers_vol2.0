---
name: playwright-test-workflow
type: skill
domain: testing
applies_to: [Claude, Copilot, codex, custom]
version: 1.0.0
task_types: [test-authoring, test-maintenance, page-objects]
depends_on: [coding-standards]
status: stable
description: Mandatory end-to-end workflow for authoring or modifying Playwright UI tests, page objects, and test infrastructure.
---

# Playwright Test Authoring Workflow Skill

Mandatory end-to-end workflow for authoring or modifying Playwright UI tests: plan-first authoring, MCP-driven exploration, test design, implementation, full-suite regression gating, CI/CD workflow sync, and validation/reporting. Use whenever creating, extending, or fixing Playwright tests or Page Objects.

## Key Principle

This skill defines the **process to follow**, not project-specific conventions — for those, align with the project's own instructions/standards files (e.g. `.github/copilot-instructions.md`, `coding-standards.md`, `test-plan.md`, `playwright.config.ts`). Follow repository patterns by default; do not override or reinterpret those documents except when directly asked to change them.

## When to Use

- Creating new Playwright UI tests
- Extending or fixing existing tests
- Creating or refactoring Page Objects
- Adding test infrastructure or utilities
- Investigating and fixing flaky tests

## When NOT to Use

- API testing (use api-testing.skill.md)
- Component testing (use component testing skill)
- Performance testing

## Workflow

### 1. Plan First — Before Any Code

Create a plan file in `.ai-outputs/` (e.g. `.ai-outputs/ui-authentication-tests-plan.md`) **before** starting any work:

```markdown
# Test Plan: [Feature Name]

## Goal

[Clear objective — what will be tested?]

## Assumptions & Open Questions

- [ ] Question 1
- [ ] Question 2

## Acceptance Criteria

- [ ] Criteria 1
- [ ] Criteria 2

## Risks

- Risk 1
- Risk 2

## Numbered Steps

1. Explore feature via Playwright MCP
2. Design test cases (map to test-plan.md tags)
3. Implement Page Objects
4. Implement test specs
5. Run full regression
6. Validate and report
```

If any requirement, acceptance criteria, test data, environment detail, or expected behavior is unclear or missing, **pause and ask** rather than guessing.

### 2. Understand the Feature

Before writing tests:

- Identify the feature/flow under test
- Check for existing similar tests or Page Objects
- Prefer extending over creating new structures
- Review project's `test-plan.md` to understand tagging strategy
- Understand the expected user journey

### 3. Explore UI Behavior via Playwright MCP

Use Playwright MCP tools to:

- Navigate the feature and understand page structure
- Identify stable element locators (test id > role > label > text)
- Observe dynamic behavior and state changes
- Record confirmed/rejected assumptions in the plan
- Identify new risks or missing pieces

**Commands to use:**

```bash
# Open browser and navigate
playwright open https://app.example.com

# Take snapshot to see page structure
playwright snapshot

# Interact with elements
playwright click "[data-testid='login-button']"
playwright fill "[data-testid='username']" "user@example.com"
playwright type "password"
playwright press Enter
```

### 4. Design the Test

Map test scenarios to the project's test plan:

- ✅ **Happy path**: Valid user inputs, expected success
- ❌ **Sad paths**: Invalid input, missing fields, unauthorized
- ⚠️ **Edge cases**: Empty states, boundary values, race conditions

**Use hard assertions for:**

- Flow-critical conditions (prerequisites, authentication)
- User-observable behavior (page titles, button states, form submission)

**Use soft assertions (`expect.soft(...)`) only when:**

- Checking independent values in the same state
- Reporting multiple mismatches has diagnostic value
- Never to mask a failed prerequisite or replace flow-controlling assertions

**Select tags strictly from project's `test-plan.md`** — if a tag is needed that doesn't exist, add it to test-plan.md first.

### 5. Implement Tests

Follow these patterns:

#### Page Objects

```typescript
// page-objects/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="username"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="login-button"]');
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.locator('[data-testid="error"]')).toContainText(
      message,
    );
  }
}
```

#### Test Specs

```typescript
// tests/ui/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";

test.describe("Login Flow @authentication", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("User can log in with valid credentials @smoke", async () => {
    // Arrange
    const testUser = {
      email: "user@example.com",
      password: "correct-password",
    };

    // Act
    await loginPage.login(testUser.email, testUser.password);

    // Assert
    await expect(page).toHaveURL("/dashboard");
  });

  test("User sees error on invalid password @negative", async () => {
    // Arrange
    const invalidPassword = "wrong-password";

    // Act
    await loginPage.login("user@example.com", invalidPassword);

    // Assert
    await loginPage.expectErrorMessage("Invalid credentials");
  });
});
```

#### Locator Best Practices

**Preferred order:**

1. Test IDs: `[data-testid="login-button"]`
2. Roles: `button[name="Sign In"]`
3. Labels: `[aria-label="Username"]`
4. Text: `text="Submit"`

**Avoid:**

- Brittle selectors like `.container > div > span`
- Deep CSS paths or XPaths
- Relying on element order

### 6. Run Full Regression Suite (Mandatory)

After every change, run the entire test suite:

```bash
# Run all tests
npx playwright test

# Run specific project (e.g., ui-tests)
npx playwright test --project=ui-tests

# Run single file
npx playwright test tests/ui/login.spec.ts
```

**Important:** Any pre-existing failure stops implementation immediately until fixed. Do not proceed with new tests until the full suite is green.

### 7. Sync CI/CD if Infrastructure Changed

If the change adds/renames env vars or test infrastructure:

```bash
# Update .github/workflows/*.yml

# Public config via:
${{ vars.NAME }}

# Secrets via:
${{ secrets.NAME }}

# Never inline credentials
```

Confirm the workflow targets the correct GitHub environment.

### 8. Validate

Before submitting for review:

- [ ] Tags are correct and exist in `test-plan.md`
- [ ] Assertions check user-observable behavior
- [ ] No duplicated selectors or logic outside Page Objects
- [ ] No hardcoded test data
- [ ] Page Object pattern is used consistently
- [ ] Style matches existing tests
- [ ] Full regression suite passes

Re-run the suite one final time to confirm.

### 9. Report

Summarize:

- Changes and touched files (including workflows)
- Which tests ran and their results
- Any CI/CD updates made
- Remaining assumptions, risks, or open questions
- Mark plan complete or ready for review

## Example Complete Workflow

```markdown
# Test Plan: User Registration Flow

## Goal

Implement UI tests for the user registration flow including validation and error handling.

## Assumptions & Open Questions

- [x] Email validation uses RFC 5322
- [x] Password minimum 8 characters
- [x] Terms acceptance is required

## Acceptance Criteria

- [x] Happy path test: user registers with valid data
- [x] Sad path: email already exists
- [x] Sad path: password too short
- [x] Edge case: email field with spaces

## Tests Created

1. ✅ registration-happy-path.spec.ts (happy path, edge case)
2. ✅ registration-validation.spec.ts (email exists, password weak)

## CI/CD Changes

Updated `.github/workflows/playwright-tests.yml` to run ui-tests on pull requests

## Status

✅ Complete and validated
```

## Best Practices

1. **One intent per test** — Each test should verify one user-observable behavior
2. **Use Page Objects** — Never duplicate selectors across tests
3. **No hardcoded waits** — Use `expect()` which auto-waits
4. **Test data factories** — Use factories for complex test scenarios
5. **Keep tests independent** — No test should depend on another's side effects
6. **Use project configurations** — Separate `ui-tests` from `api-tests` in `playwright.config.ts`

## Common Pitfalls

- ❌ Not updating `test-plan.md` with test tags
- ❌ Using brittle CSS selectors instead of test IDs
- ❌ Skipping full regression runs before submitting
- ❌ Hardcoding test data instead of using factories
- ❌ Using `sleep()` instead of proper waits

## Configuration

Check these files for project-specific conventions:

- `playwright.config.ts` — Test configuration and projects
- `test-plan.md` — Test tags and strategy
- `coding-standards.md` — Code conventions
- `.github/copilot-instructions.md` — Project guidelines
- `page-objects/` — Existing Page Object patterns

## Related Skills

- **api-testing** — Testing REST APIs with Playwright's request fixture
- **coding-standards** — Repository code conventions
- **code-review** — Reviewing test code
