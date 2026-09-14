# Code Cleanup Quick Reference

Fast lookup for common cleanup operations.

## Quick Start

```bash
# Clean a single file
./scripts/cleanup.sh "src/utils.ts"

# Clean multiple files
./scripts/cleanup.sh "src/**/*.ts"

# Clean a directory
./scripts/cleanup.sh "src/pages/"
```

## One-Line Commands

```bash
# Lint only
npx eslint --fix "src/**/*.ts"

# Format only
npx prettier --write "src/**/*.ts"

# Remove comments only
node ./scripts/remove-comments.js "src/**/*.ts"

# Full cleanup
.github/skills/code-cleanup/scripts/cleanup.sh "src/**/*.ts"
```

## Preserved Comments

✅ Preserved:

- `// Arrange`, `// Act`, `// Assert` (test markers)
- `// TODO`, `// FIXME`, `// HACK`, `// NOTE`, `// XXX`, `// WARN`, `// DEPRECATED`
- `/**` JSDoc/TSDoc blocks
- `@param`, `@returns`, `\` doc markers

❌ Removed:

- Explanatory comments
- Outdated notes
- Temporary markers
- Inline clarifications

## Common Patterns

| Task                 | Command                                                                                |
| -------------------- | -------------------------------------------------------------------------------------- |
| Clean before commit  | `./scripts/cleanup.sh "src/**/*.ts" && git add . && git commit -m "refactor: cleanup"` |
| Clean feature branch | `git diff main --name-only \| xargs ./scripts/cleanup.sh`                              |
| Dry run              | `cp -r src src.backup && ./scripts/cleanup.sh "src/**/*.ts" && diff -r src src.backup` |
| Clean with testing   | `./scripts/cleanup.sh "src/**/*.ts" && npm test`                                       |
| Clean tests only     | `./scripts/cleanup.sh "tests/**/*.spec.ts"`                                            |

## File Patterns

```bash
# TypeScript files
src/**/*.ts

# React/TypeScript files
src/**/*.{ts,tsx}

# All code files
src/**/*.{ts,tsx,js,jsx,mjs,cjs}

# Specific directory
src/pages/

# Multiple directories
"src/**/*.ts" "tests/**/*.spec.ts"
```

## Troubleshooting

| Problem                  | Solution                         |
| ------------------------ | -------------------------------- |
| "Cannot find eslint"     | `npm install`                    |
| "Permission denied"      | `chmod +x ./scripts/cleanup.sh`  |
| "glob module not found"  | `npm install --save-dev glob`    |
| Tests fail after cleanup | Review changes, revert if needed |
| Comments not removed     | Check preserved markers list     |

## Configuration Files

- **ESLint**: `eslint.config.mjs`
- **Prettier**: `.prettierrc` or `prettier.config.js`
- **Ignore files**: `.eslintignore`, `.prettierignore`
- **TypeScript**: `tsconfig.json`

## Links

- [Full Documentation](../SKILL.md)
- [Configuration Guide](./CONFIGURATION.md)
- [Examples & Scenarios](./EXAMPLES.md)
- [Comment Removal Details](./EXAMPLES.md#comment-removal-examples)
