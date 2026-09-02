# AI-Testers Vol2.0

Playwright end-to-end tests for the Rolnopol application. The suite covers
authentication, navigation, documentation pages, and other planned farm
management and marketplace flows.

## Requirements

- Node.js 20 or newer
- npm (included with Node.js)
- A running Rolnopol application available at
  `http://localhost:3000`

The test plan assumes the application provides the following pages:

- `http://localhost:3000`
- `http://localhost:3000/docs.html`
- `http://localhost:3000/swagger.html`

## Installation

Clone the repository, then install its dependencies:

```bash
git clone https://github.com/PiotrekBudny/AI-Testers_vol2.0.git
cd AI-Testers_vol2.0
npm install
```

Playwright browsers are installed automatically before `npm test`. To install
them separately, run:

```bash
npx playwright install
```

## Getting started

1. Start the Rolnopol application on `http://localhost:3000`.
2. From the repository root, install dependencies with `npm install`.
3. Run the test suite with `npm test`.
4. Open the generated report with `npx playwright show-report`.

The demo account used by the test plan is
`demo@example.com` / `demo123` (farmer).

## Test commands

| Command | Description |
| --- | --- |
| `npm test` | Run all Playwright tests in Chromium |
| `npm run test:headed` | Run tests with a visible browser |
| `npx playwright test --grep @smoke` | Run critical-path smoke tests |
| `npx playwright show-report` | Open the latest HTML report |

Tags are defined in [`test-plan.md`](test-plan.md), and can be combined with
Playwright's `--grep` and `--grep-invert` options.

## Test reports

Playwright generates an HTML report in `playwright-report/`. It is configured
not to open automatically; use `npx playwright show-report` to view it.
Test artifacts are written to `test-results/`, and traces are retained for
failed tests to help diagnose problems.

## Project structure

```text
src/
  pages/       Page objects and application URLs
  test-data/   Reusable test data
tests/         Playwright test specifications
playwright.config.ts
test-plan.md
```

Page objects contain reusable navigation and interaction logic. Test
specifications contain assertions and are organized under `tests/`.
