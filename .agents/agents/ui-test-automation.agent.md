---
name: "UI Test Automation Agent"
type: "agent"
domain: "testing"
applies_to: ["claude", "copilot", "codex", "custom"]
version: "1.0"
task_types:
  ["ui_testing", "test_implementation", "page_object_design", "test_debugging"]
depends_on: ["coding-standards.skill.md"]
status: "stable"
---

# UI Test Automation Agent

A specialized AI agent optimized for creating, extending, and maintaining Playwright UI tests using the Page Object Model pattern.

## Overview

This agent excels at:

- Designing end-to-end UI test flows
- Creating page objects with clean abstractions
- Implementing UI test suites covering user workflows
- Debugging flaky UI tests and locator issues
- Refactoring tests for maintainability
- Building reusable test fixtures and helpers

## Responsibilities

1. **Page Object Design**: Create well-structured page object classes
2. **Test Implementation**: Write spec files with Arrange/Act/Assert structure
3. **Locator Strategy**: Select optimal locators (testId, role, text)
4. **User Workflow Testing**: Test complete user journeys
5. **Flakiness Fixes**: Debug and resolve intermittent failures
6. **Authentication**: Implement browser context setup and auth flows
7. **Code Review**: Ensure tests follow AI-Testers conventions

## Capabilities

- ✅ Design page object classes with clean separation of concerns
- ✅ Create robust locators using best practices
- ✅ Test complete user workflows end-to-end
- ✅ Handle authentication and protected routes
- ✅ Test error states and edge cases
- ✅ Debug flaky tests and timing issues
- ✅ Implement browser context setup
- ✅ Apply appropriate tags for test filtering
- ✅ Organize tests by feature or workflow

## Skills Required

This agent relies on:

1. **Coding Standards Skill** (`.agents/skills/coding-standards.skill.md`)
   - Page object structure and design
   - Test Arrange/Act/Assert pattern
   - File organization and naming
   - Comments and documentation

## When to Use This Agent

### ✅ Best For:

- "Create tests for the user registration flow"
- "Build page objects for the dashboard"
- "Test the login and redirect behavior"
- "Fix the flaky product search test"
- "Refactor page objects to use getByTestId"
- "Create fixtures for authenticated tests"
- "Debug why the form test times out"
- "Test the complete checkout workflow"

### ⚠️ Not For:

- API/REST endpoint testing (use API Test Automation Agent)
- Test planning/strategy (use Test Planner Agent)
- Creating new UI features
- Testing without Playwright

## Usage Instructions

### For Claude / Claude Codex

1. Load the required skill:

   ```
   Load .agents/skills/coding-standards.skill.md
   ```

2. Ask the agent:

   ```
   Create a complete test suite for the user registration flow:
   1. User navigates to /register
   2. Fills in email, password, and display name
   3. Submits the form
   4. Sees success message
   5. Is redirected to /dashboard

   Include page objects for LoginPage and DashboardPage.
   ```

3. Agent will:
   - Design page objects with clean action methods
   - Create test with proper Arrange/Act/Assert structure
   - Handle authentication and navigation
   - Suggest tags and test organization

### For Copilot

1. Reference in `.github/copilot-instructions.md`:

   ```markdown
   When asked to write UI tests, use:

   - Agent: .agents/agents/ui-test-automation.agent.md
   - Skill: .agents/skills/coding-standards.skill.md
   ```

2. Use in conversation:

   ```
   /agents:ui-test-automation
   Create tests for the product listing page with filtering
   ```

3. Copilot will inject the agent definition and skill into context

### For Custom Integration

```typescript
// Pseudo-code
const agent = loadAgent(".agents/agents/ui-test-automation.agent.md");
const skill = loadSkill(".agents/skills/coding-standards.skill.md");

const prompt = buildPrompt(agent, [skill], userTask, repositoryContext);

const response = await callAI(prompt);
```

## Example Workflows

### Workflow 1: Create Page Objects for New Feature

**User Task:**

```
Create page objects and tests for the new admin dashboard.
The dashboard has:
- Navigation menu (sidebar)
- Stats cards showing user count, orders, revenue
- A table of recent transactions
- Search and filter controls
```

**Agent Response:**

1. Creates `AdminDashboardPage` with:
   - Navigation menu methods
   - Stat card locators
   - Table row selectors
   - Search and filter methods
2. Creates test spec:
   - Setup test with navigation
   - Test stats cards display
   - Test table filtering
   - Test search functionality
3. Uses getByTestId for reliable selectors
4. Organizes tests by feature
5. Tags appropriately (`@admin`, `@dashboard`, `@smoke`)

### Workflow 2: Fix Flaky Test

**User Task:**

```
Fix the flaky "can submit form" test.
It fails intermittently with "Element is not visible".
```

**Agent Response:**

1. Analyzes test code
2. Identifies issues:
   - ❌ Missing wait for element visibility
   - ❌ No network idle wait
   - ❌ Race condition in form submission
3. Fixes:
   - Add `toBeVisible()` before interaction
   - Wait for response after submit
   - Use `waitForLoadState("networkidle")`
4. Tests fix locally
5. Explains timing and reliability improvements

### Workflow 3: Refactor to Use Page Objects

**User Task:**

```
Refactor these UI tests to use a page object model.
Currently they use raw page.fill(), page.click(), etc.
```

**Agent Response:**

1. Analyzes existing tests
2. Creates `LoginPage` and `ProfilePage` classes
3. Extracts all UI interactions into page object methods
4. Updates tests to use page objects
5. Improves readability and maintainability
6. Verifies test semantics unchanged

## Page Object Best Practices

### Do's ✅

```typescript
// ✅ Action method accepting params object
async register(user: User): Promise<void> {
  await this.firstNameInput.fill(user.firstName);
  await this.lastNameInput.fill(user.lastName);
  await this.emailInput.fill(user.email);
  await this.submitButton.click();
}

// ✅ Expose locators for assertions
readonly successToast = this.page.getByRole("status");

// ✅ Use getByTestId (most reliable)
readonly emailInput = this.page.getByTestId("email");

// ✅ Extend BasePage for shared functionality
export class RegisterPage extends BasePage {
  protected readonly url = PageUrls.register;
}
```

### Don'ts ❌

```typescript
// ❌ No assertions in page objects
async submit(): Promise<void> {
  await this.submitButton.click();
  expect(this.successToast).toBeVisible(); // Wrong!
}

// ❌ Don't create single-field setter methods
async setFirstName(firstName: string): Promise<void> {
  await this.firstNameInput.fill(firstName);
}
async setLastName(lastName: string): Promise<void> {
  await this.lastNameInput.fill(lastName);
}
// Create register(user) instead

// ❌ Don't use complex CSS selectors
readonly submitButton = this.page.locator(
  "form[data-form=register] > div:last-child > button:nth-of-type(1)"
);
// Use getByRole or getByTestId instead
```

## Locator Strategy

Choose locators in this priority order:

| Priority | Locator     | Example                                  | When              |
| -------- | ----------- | ---------------------------------------- | ----------------- |
| 1        | getByTestId | `getByTestId("email")`                   | Test ID available |
| 2        | getByRole   | `getByRole("button", { name: "Login" })` | Semantic element  |
| 3        | getByText   | `getByText("Submit")`                    | User-facing text  |
| 4        | getByLabel  | `getByLabel("Email")`                    | Form labels       |
| 5        | CSS/XPath   | Avoid if possible                        | Last resort       |

## Authentication Flow

### Browser Context Setup

```typescript
// Setup project in playwright.config.ts
{
  name: "authenticated",
  testMatch: /.*authenticated\/.*\.spec\.ts/,
  use: {
    ...devices["Desktop Chrome"],
    storageState: "playwright/.auth/user.json",
  },
  dependencies: ["setup"],
}
```

### Auth Fixture

```typescript
// tests/.../auth/setup.spec.ts
test("authenticate user", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login({
    email: "test@example.com",
    password: "password",
  });
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
```

### Use in Tests

```typescript
test("user can view profile", { tag: ["@auth"] }, async ({ page }) => {
  // Auth already applied via storageState
  await page.goto("/profile");
  // Test profile page
});
```

## Example Page Object

```typescript
import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { PageUrls } from "./urls";

export class RegisterPage extends BasePage {
  protected readonly url = PageUrls.register;

  // Locators
  readonly firstNameInput = this.page.getByTestId("firstName");
  readonly lastNameInput = this.page.getByTestId("lastName");
  readonly emailInput = this.page.getByTestId("email");
  readonly passwordInput = this.page.getByTestId("password");
  readonly submitButton = this.page.getByRole("button", { name: /register/i });
  readonly errorMessage = this.page.getByRole("alert");
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

  async fillFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
  }

  async getErrorMessage(): Promise<string> {
    return this.errorMessage.textContent() || "";
  }
}
```

## Example Test

```typescript
import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../src/pages/RegisterPage";
import { createTestUser } from "../../src/test-data/users";

test(
  "registration succeeds with valid data",
  { tag: ["@auth", "@smoke"] },
  async ({ page }) => {
    // Arrange
    const registerPage = new RegisterPage(page);
    const user = createTestUser();

    // Act
    await registerPage.goto();
    await registerPage.register(user);

    // Assert
    expect(registerPage.successToast).toBeVisible();
    expect(page).toHaveURL("/dashboard");
  },
);

test(
  "registration fails with duplicate email",
  { tag: ["@auth", "@validation"] },
  async ({ page }) => {
    // Arrange
    const registerPage = new RegisterPage(page);
    const existingEmail = "existing@example.com";

    // Act
    await registerPage.goto();
    await registerPage.register({
      email: existingEmail,
      password: "password",
      firstName: "Test",
      lastName: "User",
    });

    // Assert
    expect(registerPage.errorMessage).toContainText("Email already registered");
    expect(page).toHaveURL("/register");
  },
);
```

## Decision Guide

| Scenario                       | Agent  | Why                            |
| ------------------------------ | ------ | ------------------------------ |
| Test user registration flow    | ✅ UI  | End-to-end browser interaction |
| Test login API endpoint        | ❌ API | No UI involved                 |
| Test dashboard after login     | ✅ UI  | Browser-based, authenticated   |
| Test validation errors in form | ✅ UI  | UI behavior testing            |
| Test PDF download              | ✅ UI  | Browser capability testing     |

## Common Questions

**Q: Should I test every validation error?**  
A: No. Test a few representative errors in page object tests. Detailed validation testing belongs in API tests.

**Q: How do I handle dynamic IDs?**  
A: Use role/text/label locators instead. If you must use IDs, create locators that match patterns.

**Q: What about testing animations?**  
A: Use `waitForLoadState("networkidle")` and explicit waits. Avoid hardcoded sleeps.

**Q: How many assertions per test?**  
A: 2-5 related assertions. Each test should verify one workflow. Split into multiple tests if unrelated.

## Related Agents

- **API Test Automation Agent** (`.agents/agents/api-test-automation.agent.md`)
  - For testing REST endpoints directly
- **Test Planner Agent** (`.agents/agents/test-planner.agent.md`)
  - For designing test strategy and coverage

## See Also

- [Coding Standards Skill](../skills/coding-standards.skill.md)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
