---
name: static-code-analysis-typescript
type: skill
domain: code-quality
applies_to: [Claude, Copilot, codex, custom]
version: 1.0.0
task_types: [code-quality, tooling-setup, ci-configuration]
depends_on: [coding-standards]
status: stable
description: Create, review, or modernize static code analysis for Node.js and TypeScript repositories.
---

# Static Code Analysis for TypeScript Skill

Create, review, or modernize static code analysis for Node.js and TypeScript repositories.

## When to Use

- Setting up ESLint, TypeScript, and Prettier for a new project
- Reviewing or modernizing linting and type-checking configurations
- Adding import sorting and code style enforcement
- Setting up pre-commit hooks (Husky, lint-staged)
- Creating CI quality gates for GitHub Actions
- Fixing lint violations and type errors
- Standardizing naming and scripts in package.json
- Auditing compliance with code analysis best practices

## Recommended Stack

A strong baseline for TypeScript projects includes:

- **ESLint** with flat config (`eslint.config.mjs`)
- **typescript-eslint** for TypeScript-aware linting
- **TypeScript** (`typescript` package for `tsc`)
- **Prettier** for code formatting
- **eslint-plugin-simple-import-sort** for import organization
- **Husky** for local git hooks
- **lint-staged** for staged-file workflows
- **GitHub Actions** for CI quality gates
- Node version pinning in `package.json#engines`

## Key Components

### 1. ESLint Configuration

Modern ESLint uses flat config (`.mjs` file):

```javascript
// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importSort from "eslint-plugin-simple-import-sort";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      "simple-import-sort": importSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
];
```

### 2. TypeScript Configuration

Strict `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Prettier Configuration

Keep Prettier separate from ESLint:

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### 4. Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "quality": "npm run type-check && npm run lint && npm run format"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 5. Husky Pre-commit Hook

```bash
#!/usr/bin/env sh

# .husky/pre-commit
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

### 6. lint-staged Configuration

```json
// .lintstagedrc
{
  "**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "**/*.{json,md}": ["prettier --write"]
}
```

### 7. GitHub Actions Quality Gate

```yaml
# .github/workflows/quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run format -- --check
```

## Workflow

### 1. Assess Current State

- What linting tools exist (ESLint, TSLint, etc.)?
- What formatters are in use (Prettier, etc.)?
- Are pre-commit hooks configured?
- What CI checks exist?

### 2. Design Configuration

- Choose ESLint rules appropriate for the project
- Enable typescript-eslint for strict type checking
- Set up import sorting
- Configure Prettier for formatting
- Plan Husky/lint-staged for local workflows

### 3. Implement Tooling

- Update `package.json` with dependencies
- Create ESLint config
- Create TypeScript config
- Configure Prettier
- Set up Husky hooks
- Create lint-staged config

### 4. Configure CI/CD

- Create or update GitHub Actions workflow
- Ensure linting, type-checking, and formatting checks run
- Make checks blocking (required for merge)

### 5. Validate & Test

```bash
# Run all checks locally
npm run quality

# Run individual checks
npm run type-check
npm run lint
npm run lint:fix  # Auto-fix violations
npm run format
```

## Common Issues

### Issue: ESLint and Prettier conflicting rules

**Solution:** Use `eslint-config-prettier` to disable ESLint rules that conflict with Prettier:

```javascript
// eslint.config.mjs
import prettier from "eslint-config-prettier";

export default [
  // ... other configs
  prettier,
];
```

### Issue: TypeScript files not linting

**Solution:** Ensure `typescript-eslint` is configured and files are matched:

```javascript
// eslint.config.mjs
{
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { project: true },
  },
}
```

### Issue: Slow linting on large projects

**Solution:** Exclude unnecessary directories:

```javascript
{
  ignores: ['node_modules/**', 'dist/**', 'build/**'],
}
```

## Best Practices

1. **Start strict, relax only when necessary** — Enable all recommended rules, then selectively disable
2. **Keep Prettier separate** — Don't mix formatting rules into ESLint
3. **Use pre-commit hooks** — Catch issues before pushing
4. **Make CI checks blocking** — Ensure quality gates are enforced
5. **Document your rules** — Add comments explaining why rules are configured the way they are
6. **Update regularly** — Keep eslint and typescript-eslint up to date
7. **Share configs** — Use shareable configs for consistency across projects

## File Organization

```
project-root/
├── eslint.config.mjs          # ESLint configuration
├── tsconfig.json              # TypeScript configuration
├── .prettierrc                # Prettier configuration
├── .husky/
│   └── pre-commit             # Pre-commit hook
├── .lintstagedrc              # Lint-staged config
├── .github/
│   └── workflows/
│       └── quality.yml        # CI quality gate
└── package.json               # Scripts and engines
```

## Related Skills

- **code-cleanup** — Automated code cleanup and formatting
- **code-review** — Reviewing code changes
- **coding-standards** — Project-specific conventions
