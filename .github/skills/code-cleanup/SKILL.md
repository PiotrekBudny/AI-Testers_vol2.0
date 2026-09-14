---
name: code-cleanup
description: "Clean and standardize code by removing comments, running ESLint for linting, and Prettier for formatting. Use when: refactoring code, preparing code for review, standardizing code style, removing unnecessary comments, fixing lint violations, or auto-formatting."
argument-hint: "File paths (comma-separated or glob pattern) to clean"
user-invocable: true
---

# Code Cleanup

Automated workflow to clean code files by removing unnecessary comments, enforcing ESLint rules, and applying Prettier formatting.

## When to Use

- Removing unnecessary or outdated comments from source files
- Standardizing code formatting across a project
- Fixing lint violations and style inconsistencies
- Preparing code for peer review
- Bulk refactoring of multiple files
- Enforcing project code style standards

## Procedure

### 1. Select Target Files

Specify the files or patterns to clean:

- Single file: `src/utils/helpers.ts`
- Multiple files: `src/**/*.ts,tests/**/*.spec.ts`
- Directory: `src/` (all files in directory)

### 2. Run the Cleanup Script

Execute the [cleanup script](./scripts/cleanup.sh) with your target files:

```bash
./scripts/cleanup.sh "src/your-file.ts"
```

The script performs the following steps in order:

1. **Comment Removal**: Strips comments while preserving code structure
2. **ESLint**: Fixes auto-fixable linting violations
3. **Prettier**: Formats code according to project standards

### 3. Review Changes

After running cleanup:

- Check modified files for correctness
- Verify that comments were removed appropriately
- Confirm lint and format changes are desirable
- Run your test suite to ensure functionality is preserved

### 4. Commit Changes

Once validated:

```bash
git add [cleaned-files]
git commit -m "refactor: clean up code, remove comments, and apply formatting"
```

## Configuration

The skill uses your project's existing configuration:

- **ESLint**: `eslint.config.mjs` (or `.eslintrc.*`)
- **Prettier**: `.prettierrc` or `prettier.config.*`
- **TypeScript**: `tsconfig.json` for proper parsing

## Advanced Usage

### Comment Removal Details

The cleanup removes:

- Single-line comments (`//`)
- Multi-line comments (`/* */`)
- Trailing inline comments

Preserved:

- Required test markers: `// Arrange`, `// Act`, `// Assert`
- JSDoc/TSDoc blocks (intentional documentation)
- Shebang lines (`#!/usr/bin/env`)

### Selective Cleanup

Run individual steps if needed:

```bash
# Lint only (no format):
npx eslint --fix "src/file.ts"

# Format only (no lint):
npx prettier --write "src/file.ts"

# Comment removal only:
node ./scripts/remove-comments.ts "src/file.ts"
```

## Troubleshooting

| Issue                       | Solution                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| "Cannot find eslint"        | Run `npm install` to ensure dependencies are installed                                      |
| "Unexpected formatting"     | Verify `.prettierrc` config and ESLint rules in `eslint.config.mjs`                         |
| "Comments not removed"      | Check that file extension is recognized in comment removal script                           |
| "Test errors after cleanup" | Review the cleanup output and revert if necessary; comments may have been important context |

## See Also

- [Coding Standards](../../coding-standards.md) - Project code style conventions
- [ESLint Config](../../eslint.config.mjs) - Linting rules
- [Prettier Config](.prettierrc) - Formatting configuration
