---
name: playwright-test-workflow
description: "Mandatory end-to-end workflow for authoring or modifying Playwright UI tests: plan-first authoring, MCP-driven exploration, test design, implementation, full-suite regression gating, CI/CD workflow sync, and validation/reporting. Use whenever creating, extending, or fixing Playwright tests or Page Objects."
argument-hint: "Feature/flow under test, and whether it's a new test or a fix to an existing one"
user-invocable: true
disable-model-invocation: false
---

# Playwright Test Authoring Workflow

Use this skill whenever creating, extending, or fixing Playwright UI tests or Page Objects. It defines the process to follow, not project-specific conventions — for those, align with the project's own instructions/standards files (e.g. `.github/copilot-instructions.md`, `coding-standards.md`, `test-plan.md`, `playwright.config.ts`). Follow repository patterns by default; do not override or reinterpret those documents except when directly asked to change them.

Maintain a plan file in `.ai-outputs/` for the task (e.g. `.ai-outputs/ui-authentication-tests-plan.md`) covering goal, assumptions/open questions, risks, and numbered steps. Create it before doing anything else, and keep it updated as steps below produce new findings, design changes, or progress — don't start execution before it exists.

## Workflow

1. **Clarify before proceeding.** If any requirement, acceptance criteria, test data, environment detail, or expected behavior is unclear or missing, pause, log the open question in the plan, and ask rather than guessing.
2. **Understand before writing.** Identify the feature/flow under test, check for an existing similar test or Page Object, and prefer extending it over creating new structures.
3. **Explore UI behavior via Playwright MCP.** Understand page structure/navigation, observe dynamic behavior and state changes, and identify stable elements suitable for locators. Record confirmed/rejected assumptions and new risks in the plan.
4. **Design the test.** Map cases to the project's test plan, select tags strictly from it, keep one intent per test. Use hard assertions for flow-critical conditions/prerequisites; use `expect.soft(...)` only for independent checks in the same state where reporting all mismatches has diagnostic value — never to mask a failed prerequisite or replace a flow-controlling assertion.
5. **Implement.** Use the Page Object pattern, stable locators (test id, role, label, text), and no sleeps/magic timeouts.
6. **Run the full regression suite (mandatory, non-skippable).** After every change, run the whole suite (e.g. `npx playwright test`), not just new tests. Any pre-existing failure stops implementation immediately until fixed and the full suite is re-run green. Fix failures in newly added tests too before moving on.
7. **Sync CI/CD if infrastructure changed.** If the change adds/renames env vars or test infrastructure, update `.github/workflows/*.yml` to match: public config via `${{ vars.NAME }}`, secrets via `${{ secrets.NAME }}`, never inlined. Confirm the workflow targets the correct GitHub environment.
8. **Validate.** Confirm tags are correct, assertions check user-observable behavior, no duplicated selectors/logic outside Page Objects, and style matches existing tests. Re-run the suite.
9. **Report.** Summarize changes and touched files (including workflows), which tests ran, any CI/CD updates, and remaining assumptions/risks/open questions. Mark the plan complete or ready for review.
