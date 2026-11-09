# Repository Agent Instructions

These instructions apply to work in this repository. Follow direct user instructions and any more specific instructions in nested `AGENTS.md` files. When another source conflicts, follow the higher-priority instruction and explain material conflicts.

## Before Making Changes

- Inspect the relevant files, tests, configuration, and documentation; follow existing project patterns.
- Check the current worktree before editing and preserve unrelated user changes.
- Keep edits within the requested scope. Do not invent behavior or claim a check passed without results.
- Do not add or run tests unless the user asks.

## Playwright and Test Conventions

- Read `playwright.config.ts` and `test-plan.md` before creating or changing tests; use the configured base URL, timeout, projects, and supported tags.
- Give each test body `// Arrange`, `// Act`, and `// Assert` sections in that order. Put `expect()` calls in tests' Assert sections, never in Page Objects or helpers.
- Every test must have a tag matching its area, selected from the `## Tags` table in `test-plan.md`. Add new tags to that table first. Use `@smoke` only for critical paths.
- Put reusable UI interactions in `src/pages/`, one `<Page>Page` class per page. Extend `BasePage`; set `protected readonly url` from `PageUrls` in `src/pages/urls.ts`; initialize readonly locators on the class.
- Page Objects locate elements and perform actions; expose assertion locators as public readonly fields. Keep checks in tests. Prefer a typed form/workflow method over multiple single-field setters.
- Prefer locators in this order: test ID, role, label or visible text, then CSS/XPath only when needed.
- Keep tests independent and test data isolated. Use condition-based waits; avoid arbitrary sleeps.

## Security and Repository-Specific Rules

- Never read or reference `.env`. When AI-related automation needs credentials or configuration, use `.env.ai` and do not expose its values.
- Do not add code comments except the required Arrange/Act/Assert markers. Follow the repository's Conventional Commit format when asked to create a commit.
- Playwright MCP snapshots and screenshots use the configured `.playwright-mcp/` output directory. Give artifacts descriptive names and do not manually redirect them.

## Verification

Use the checks the user requests. If a task or repository instruction requires validation, use existing scripts/configuration and report the exact checks and outcomes, including failures or checks not run.
