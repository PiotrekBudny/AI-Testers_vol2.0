# AI-Testers Vol2.0

Playwright tests for the Rolnopol application.

## Requirements

- Node.js `^20.19.0 || ^22.13.0 || >=24` (see `engines` in [package.json](package.json))

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

## Static code analysis

This repository enforces formatting, linting, and type checking through the following scripts:

| Script         | Purpose                                       | Mutates files?  | Used in CI? |
| -------------- | --------------------------------------------- | --------------- | ----------- |
| `check`        | Local aggregate: format + lint + tsc check    | Yes (`--write`) | No          |
| `check:ci`     | CI aggregate: format:check + lint + tsc check | No              | Yes         |
| `format`       | Apply Prettier formatting                     | Yes             | No          |
| `format:check` | Validate formatting with Prettier             | No              | Yes         |
| `lint`         | Run ESLint (includes import sorting)          | No              | Yes         |
| `lint-staged`  | Run Prettier/ESLint on staged files only      | Yes (fix mode)  | No          |
| `tsc:check`    | TypeScript type checking (`tsc --noEmit`)     | No              | Yes         |

Notes:

- Formatting is validated by the Prettier CLI (`format:check`) for **all** files, including `.ts`. ESLint (`lint`) is responsible for code-quality rules, including import order via `eslint-plugin-simple-import-sort` — it does not duplicate Prettier's formatting rules (`eslint-config-prettier` disables any overlap).
- Import order is enforced by ESLint, not by Prettier or VS Code's built-in organizer. Do not re-enable `editor.codeActionsOnSave.source.organizeImports` in `.vscode/settings.json` — it conflicts with the ESLint-based sorting.
- A Husky `pre-commit` hook runs `lint-staged` (Prettier + ESLint `--fix` on staged files) followed by a full `tsc:check`.
- CI runs `format:check`, `lint`, and `tsc:check` in a `quality` job in [.github/workflows/playwright-tests.yml](.github/workflows/playwright-tests.yml); the Playwright test job only runs after the quality job passes.

Run the full local check before pushing:

```bash
npm run check
```
