# Coding Standards

## Page Objects (`src/pages/`)

- One class per page, named `<Page>Page` (e.g. `RegisterPage`).
- Extend `BasePage`, which holds the shared `page` field and the `goto()` navigation method.
- Declare the page's URL as a `protected readonly url` field; `BasePage.goto()` navigates to it.
- Store locators as `readonly` fields, initialized in the constructor.
- Prefer `page.getByTestId(...)`; fall back to role/text/class locators only when no test id exists.
- Provide action methods (e.g. `register()`) that perform steps, not checks.
- **No assertions (`expect`) in page objects.** Page objects only locate elements and perform actions — all verification belongs in test files.
- Expose locators used for assertions (e.g. `successToast`) as public readonly fields so tests can assert on them directly.
- Keep methods small and focused on a single user action or flow step.

## Tests (`tests/`)

- Review `playwright.config.ts` before creating tests to follow its configured `baseURL`, `timeout`, `projects`, and other settings.
- Structure each test body into three distinct sections, in order: Arrange, Act, Assert. Mark each with a `// Arrange`, `// Act`, `// Assert` comment.
- Put all `expect(...)` calls in the Assert section of tests, never in page objects or helpers.

### Test Tagging

Tag Playwright tests with the tags defined in `test-plan.md` so they can be filtered with
`--grep`/`--grep-invert`.

- Add tags via the test's options object: `test("name", { tag: ["@auth", "@smoke"] }, async ({ page }) => { ... })`.
- Use only tags from the `## Tags` table in `test-plan.md` (e.g. `@auth`, `@rbac`, `@farm`, `@marketplace`, `@finance`, `@e2e`, `@flagged`, `@smoke`).
- If a new scenario needs a tag that doesn't exist yet, add it to the `## Tags` table in `test-plan.md` first.
- Every test must have at least one tag matching the test area it belongs to; add `@smoke` only for critical-path cases.
