---
name: code-cleanup
type: skill
domain: code-quality
applies_to: [Claude, Copilot, codex, custom]
version: 1.0.0
task_types: [refactoring, code-formatting, lint-fixes]
depends_on: [coding-standards]
status: stable
description: Clean and standardize code by removing unnecessary comments, running ESLint for linting, and Prettier for formatting.
---

# Code Cleanup Skill

Clean and standardize code by removing unnecessary comments, running ESLint for linting, and Prettier for formatting.

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

### 2. Run the Cleanup Process

The cleanup workflow performs the following steps in order:

1. **Remove unnecessary comments**
   - Strip out `//` and `/* */` comments that don't provide code context
   - Keep documentation comments (`/** */` JSDoc, etc.) and legal headers
   - Remove commented-out code blocks

2. **Run ESLint**
   - Apply configured ESLint rules (see `.eslintrc.json` or `eslint.config.js`)
   - Auto-fix violations where possible
   - Report remaining violations for manual review

3. **Apply Prettier formatting**
   - Enforce consistent code style (indentation, line length, quotes)
   - Sort imports and organize code structure
   - Apply Prettier configuration from `.prettierrc` or `package.json`

### 3. Review and Validate

After cleanup:

```bash
# Review changes
git diff src/your-file.ts

# Run linter to confirm no violations
npm run lint

# Run tests to ensure no behavioral changes
npm test
```

### 4. Commit Changes

```bash
git add src/your-file.ts
git commit -m "style(your-scope): clean up formatting and comments"
```

## Examples

### Before Cleanup

```typescript
// This is a function
// It does something important
// TODO: optimize this later
// const oldImplementation = ...;
function processData(input: any) {
  // Get the data
  const result = input.map((x: any) => {
    // transform each item
    return {
      // create object
      id: x.id, // copy id
      name: x.name, // copy name
    };
  });
  // Return result
  return result;
}
```

### After Cleanup

```typescript
/**
 * Transforms input items into structured objects with id and name.
 */
function processData(input: any): Array<{ id: string; name: string }> {
  return input.map((x: any) => ({
    id: x.id,
    name: x.name,
  }));
}
```

## Best Practices

1. **Run cleanup on controlled batches** — Don't clean entire codebase at once; focus on files under active development
2. **Preserve documentation** — Keep JSDoc comments, README references, and legal headers
3. **Review before committing** — Check diff to ensure no meaningful code was removed
4. **Use separate commits** — Clean-up should be separate from feature commits for clearer history
5. **Keep configuration consistent** — Ensure ESLint and Prettier configs match team standards

## Configuration

Check these files for project-specific cleanup rules:

- `.eslintrc.json` or `eslint.config.js` — Linting rules
- `.prettierrc` or `package.json` prettier field — Formatting preferences
- `coding-standards.md` — Repository-specific conventions
- `.github/copilot-instructions.md` — Project guidelines

## Related Skills

- **coding-standards** — Understanding conventions for this codebase
- **static-code-analysis-typescript** — Deeper lint configuration and governance
