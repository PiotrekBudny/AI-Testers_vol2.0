# AI-Testers Vol2.0

Playwright tests for the Rolnopol application.

## Setup

```bash
npm install
```

The application under test must be available at `http://localhost:3000`.

## Run tests

```bash
npm test
npm run test:headed
```

Use `npx playwright test --grep @smoke` to run the smoke tests.

See [test-plan.md](test-plan.md) for test coverage and tags.
