# Copilot Instructions

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Rules:**

- Imperative, present tense, lowercase, no period at the end.
- Keep the summary to 72 characters or less.
- Add a scope when the change is limited to one area (e.g. `fix(playwright-config): ...`).

**Example:**

```
feat(tests): add smoke test for login flow
```

## Test Tagging Guidelines

Tag Playwright tests with the tags defined in `test-plan.md` so they can be filtered with
`--grep`/`--grep-invert`.

- Add tags via the test's options object: `test("name", { tag: ["@auth", "@smoke"] }, async ({ page }) => { ... })`.
- Use only tags from the `## Tags` table in `test-plan.md` (e.g. `@auth`, `@rbac`, `@farm`, `@marketplace`, `@finance`, `@e2e`, `@flagged`, `@smoke`).
- If a new scenario needs a tag that doesn't exist yet, add it to the `## Tags` table in `test-plan.md` first.
- Every test must have at least one tag matching the test area it belongs to; add `@smoke` only for critical-path cases.

## Writing Tests

- Review `playwright.config.ts` before creating tests to follow its configured `baseURL`, `timeout`, `projects`, and other settings.
- Structure each test body into three distinct sections, in order: Arrange, Act, Assert. Mark each with a `// Arrange`, `// Act`, `// Assert` comment.
