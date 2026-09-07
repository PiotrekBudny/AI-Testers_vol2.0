# AI-Testers Vol2.0

Playwright tests for the Rolnopol application.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and adjust values as needed. `BASE_URL` controls the app URL used by `playwright.config.ts` (defaults to `http://localhost:3000` if unset). Keep sensitive values (credentials, tokens, etc.) in `.env` only — it is git-ignored and must never be committed.

The application under test must be available at the configured `BASE_URL`.

## Run tests

```bash
npm test
npm run test:headed
```

Use `npx playwright test --grep @smoke` to run the smoke tests.

See [test-plan.md](test-plan.md) for test coverage and tags.
