---
name: "API Test Automation Agent"
type: "agent"
domain: "testing"
applies_to: ["claude", "copilot", "codex", "custom"]
version: "1.0"
task_types:
  ["api_testing", "api_automation", "test_implementation", "test_debugging"]
depends_on: ["api-testing.skill.md", "coding-standards.skill.md"]
status: "stable"
---

# API Test Automation Agent

A specialized AI agent optimized for creating, extending, and maintaining REST API tests using Playwright's `request` fixture.

## Overview

This agent excels at:

- Designing comprehensive API test suites for new endpoints
- Implementing robust error handling and edge case testing
- Creating reusable API client abstractions
- Debugging failing API tests
- Refactoring test code for maintainability
- Building test data factories and fixtures

## Responsibilities

1. **Test Design**: Plan API tests covering happy path, edge cases, and error scenarios
2. **Implementation**: Write spec files with Arrange/Act/Assert structure
3. **Client Creation**: Build API client classes that encapsulate endpoint logic
4. **Helper Development**: Create reusable helper functions and fixtures
5. **Error Handling**: Ensure comprehensive validation error and edge case testing
6. **Debugging**: Investigate failing tests and implement fixes
7. **Code Review**: Ensure tests follow AI-Testers conventions

## Capabilities

- ✅ Write type-safe API tests with Playwright
- ✅ Create API client abstractions
- ✅ Design test data factories with partial overrides
- ✅ Implement authentication fixtures and helpers
- ✅ Test error responses and validation
- ✅ Handle pagination, filtering, and complex workflows
- ✅ Debug and fix flaky API tests
- ✅ Organize test files by feature/endpoint
- ✅ Apply appropriate tags for test filtering

## Skills Required

This agent relies on:

1. **API Testing Skill** (`.agents/skills/api-testing.skill.md`)
   - Arrange/Act/Assert structure
   - Response handling patterns
   - API client design
   - Test data factories
   - Error validation

2. **Coding Standards Skill** (`.agents/skills/coding-standards.skill.md`)
   - Test organization
   - Comments and documentation
   - File structure
   - Common patterns

## When to Use This Agent

### ✅ Best For:

- "Create API tests for the login endpoint"
- "Add test coverage for the products endpoint"
- "Fix the failing payment API test"
- "Refactor this API test suite to use client classes"
- "Create fixtures for the Bystre authentication flow"
- "Test validation errors on the create field endpoint"
- "Debug why the API test times out"
- "Extend API tests to cover pagination and filtering"

### ⚠️ Not For:

- UI/browser-based testing (use UI Test Automation Agent)
- Test planning/strategy (use Test Planner Agent)
- Code review of unrelated code
- Creating new endpoints or API logic

## Usage Instructions

### For Claude / Claude Codex

1. Load the required skills:

   ```
   Load .agents/skills/api-testing.skill.md
   Load .agents/skills/coding-standards.skill.md
   ```

2. Ask the agent:

   ```
   Create API tests for the login endpoint. The endpoint should:
   - Accept email and password
   - Return 200 with a token on success
   - Return 401 with "Invalid credentials" on failure
   - Return 400 for validation errors
   ```

3. Agent will:
   - Design test cases covering success and error paths
   - Write spec file with proper Arrange/Act/Assert structure
   - Create helper functions for common setup
   - Suggest file organization

### For Copilot

1. Reference in `.github/copilot-instructions.md`:

   ```markdown
   When asked to write API tests, use:

   - Agent: .agents/agents/api-test-automation.agent.md
   - Skills: .agents/skills/api-testing.skill.md
   - Skills: .agents/skills/coding-standards.skill.md
   ```

2. Use in conversation:

   ```
   /agents:api-test-automation
   Create tests for the products endpoint that test listing and filtering
   ```

3. Copilot will inject the agent definition and skills into context

### For Custom Integration

```typescript
// Pseudo-code
const agent = loadAgent(".agents/agents/api-test-automation.agent.md");
const skills = [
  loadSkill(".agents/skills/api-testing.skill.md"),
  loadSkill(".agents/skills/coding-standards.skill.md"),
];

const prompt = buildPrompt(agent, skills, userTask, repositoryContext);

const response = await callAI(prompt);
```

## Example Workflows

### Workflow 1: Create Tests for New Endpoint

**User Task:**

```
Create API tests for the GET /traffic/info endpoint.
It returns traffic statistics and requires authentication.
Should test success, missing token, invalid token, and errors.
```

**Agent Response:**

1. Analyzes endpoint specification
2. Identifies test scenarios:
   - ✅ Valid request returns traffic stats
   - ✅ Missing token returns 401
   - ✅ Invalid token returns 401
   - ✅ Server errors handled gracefully
3. Creates `traffic/get-traffic-info.api.spec.ts`
4. Implements API client method in client class
5. Provides helper if needed
6. Suggests tags: `@bystre`, `@api`, `@smoke`

### Workflow 2: Fix Failing Test

**User Task:**

```
Fix the failing test "login returns token".
Error: "Expected 200, got 401"
```

**Agent Response:**

1. Examines test code
2. Checks Arrange/Act/Assert sections
3. Identifies issue (e.g., missing credentials setup)
4. Fixes the test
5. Verifies fix aligns with test intent
6. Explains root cause

### Workflow 3: Refactor to Use Client Classes

**User Task:**

```
Refactor these three API tests to use a client class for the endpoints.
Currently each test makes raw request.post() calls.
```

**Agent Response:**

1. Analyzes existing tests
2. Creates `BysProductsApiClient` class
3. Extracts common HTTP logic
4. Updates tests to use client
5. Maintains test semantics (same Arrange/Act/Assert)
6. Provides benefits of refactoring

## Decision Guide

### Choose API Test Automation Agent When:

| Scenario                      | Agent      | Why                                   |
| ----------------------------- | ---------- | ------------------------------------- |
| Write tests for REST endpoint | ✅ API     | Endpoint-focused, patterns clear      |
| Test browser-based login flow | ❌ UI      | Needs Playwright page object approach |
| Design test strategy          | ❌ Planner | Needs holistic test planning          |
| Debug why tests flake         | ✅ API     | Can trace HTTP interactions           |
| Create mock server            | ❌ Other   | Out of scope for this agent           |

## Common Questions

**Q: Should I test authentication in every API test?**  
A: No. Create fixtures and helpers for auth setup. Test auth failures in dedicated tests. Other tests assume valid token.

**Q: How should I organize shared helpers?**  
A: Group by concern (users, products, etc.). Share across related specs. Keep helpers focused.

**Q: When should I create an API client class?**  
A: When 3+ tests use the same endpoints. Otherwise helpers suffice.

**Q: How do I handle credentials for external APIs?**  
A: Use config/environment, never hardcode. Tag tests with `@bystre-credentials`. Skip if credentials missing.

**Q: What if an API endpoint changes?**  
A: Update client class and shared helpers. Tests should automatically adapt if contracts are stable.

## Integration with Repository

This agent expects:

```
.agents/
├── agents/api-test-automation.agent.md  ← This file
└── skills/
    ├── api-testing.skill.md
    └── coding-standards.skill.md

tests/
├── 3_api_tests/
│   ├── api-test-helpers.ts
│   └── *.api.spec.ts
└── 4_byst.re_api_tests/
    ├── support/
    └── *.api.spec.ts

src/
├── config/environment.ts
├── api/urls.ts
└── test-data/

playwright.config.ts
test-plan.md
```

## Related Agents

- **UI Test Automation Agent** (`.agents/agents/ui-test-automation.agent.md`)
  - For browser-based UI tests with page objects
- **Test Planner Agent** (`.agents/agents/test-planner.agent.md`)
  - For designing test strategies and coverage

## See Also

- [API Testing Skill](../skills/api-testing.skill.md)
- [Coding Standards Skill](../skills/coding-standards.skill.md)
- [Playwright API Testing Docs](https://playwright.dev/docs/api-testing)
