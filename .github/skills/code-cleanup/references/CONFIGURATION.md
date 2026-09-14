# Code Cleanup Configuration Guide

## Overview

This guide covers customization and advanced usage of the code cleanup skill.

## ESLint Configuration

### Default Rules

Your project uses `eslint.config.mjs`. The cleanup skill respects your ESLint configuration and only applies auto-fixable rules.

### Modifying Auto-fix Behavior

To disable auto-fix for specific rules during cleanup:

```javascript
// eslint.config.mjs
{
  rules: {
    'semi': ['error', 'never'], // Never auto-fix semicolons
    'indent': 'warn' // Warning level prevents auto-fix
  }
}
```

### Running ESLint Separately

If you only want to fix specific rules:

```bash
npx eslint --fix --rule "semi: 0" src/
```

## Prettier Configuration

### Default Settings

Prettier reads from `.prettierrc` or your `package.json` `prettier` field.

### Common Configurations

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Ignoring Files

Create `.prettierignore`:

```
node_modules/
dist/
coverage/
playwright-report/
test-results/
.playwright-mcp/
```

## Comment Removal Behavior

### Preserved Comments

The cleanup preserves:

- Test markers: `// Arrange`, `// Act`, `// Assert`
- Important notes: `// TODO`, `// FIXME`, `// HACK`, `// NOTE`, `// XXX`, `// WARN`, `// DEPRECATED`
- Documentation: JSDoc/TSDoc blocks (lines starting with `/**`, `/*`, `@`, `\`)

### Removed Comments

All other comments are removed:

- Inline explanations: `// This filters the array`
- Outdated notes: `// Added in v1.0`, `// Remove this later`
- Temporary markers: `// TEMP`, `// DEBUG`, `// TEST`

### Example

**Before:**

```typescript
// Main user list component
// This component displays all users
export const UserList: React.FC = () => {
  // Arrange - set up test data
  const users = []; // Will be populated from API

  // Fetch users from API
  // TODO: Add error handling
  // Act - render the list
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
};
```

**After:**

```typescript
export const UserList: React.FC = () => {
  // Arrange - set up test data
  const users = [];

  // TODO: Add error handling
  // Act - render the list
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
};
```

## Advanced Usage

### Dry Run (Preview Changes)

Check what will be changed without modifying files:

```bash
# Copy files to temp location, run cleanup, then diff
cp -r src src.backup
./scripts/cleanup.sh "src/**/*.ts"
diff -r src src.backup
rm -rf src.backup
```

### Selective Cleanup

Clean only specific file types:

```bash
./scripts/cleanup.sh "src/**/*.ts"      # TypeScript only
./scripts/cleanup.sh "tests/**/*.spec.ts" # Test files only
./scripts/cleanup.sh "src/pages/"        # Directory only
```

### Cleanup with Git Integration

Commit cleanup changes automatically:

```bash
./scripts/cleanup.sh "src/**/*.ts"
git add src/
git commit -m "refactor: clean up code, remove comments, and apply formatting"
```

### Partial Cleanup

Run only specific steps:

```bash
# Comments only (no lint/format)
node ./scripts/remove-comments.js "src/file.ts"

# Lint only (no comments/format)
npx eslint --fix "src/file.ts"

# Format only (no lint/comments)
npx prettier --write "src/file.ts"
```

## Troubleshooting

### ESLint Conflicts with Prettier

If Prettier and ESLint disagree on formatting:

```bash
# Install eslint-config-prettier to disable conflicting ESLint rules
npm install --save-dev eslint-config-prettier
```

Update `eslint.config.mjs`:

```javascript
import prettier from "eslint-config-prettier";

export default [
  // ... other configs
  prettier, // Disable conflicting rules
];
```

### Script Permission Denied

On Linux/macOS:

```bash
chmod +x .github/skills/code-cleanup/scripts/cleanup.sh
```

### glob Module Not Found

The remove-comments.js script uses Node's built-in `glob` for Node 16.13+. For older versions:

```bash
npm install --save-dev glob
```

### File-specific Exclusions

Add to `.eslintignore` or `.prettierignore`:

```
# .eslintignore
src/legacy/**
src/generated/**
test-data/**
```

## Performance

- Comment removal: O(n) complexity, processes ~1000 files/second
- ESLint auto-fix: Depends on rule count and file size
- Prettier: Typically <1s per file

For large projects (1000+ files), run in batches:

```bash
# Process in groups
./scripts/cleanup.sh "src/auth/**"
./scripts/cleanup.sh "src/pages/**"
./scripts/cleanup.sh "src/utils/**"
```

## See Also

- [ESLint Documentation](https://eslint.org/docs/rules/)
- [Prettier Documentation](https://prettier.io/docs)
- [SKILL.md](../SKILL.md) - Main skill documentation
