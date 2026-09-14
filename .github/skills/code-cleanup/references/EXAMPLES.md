# Code Cleanup Examples

Common use cases and examples for the code cleanup skill.

## Basic Usage Examples

### Clean a Single File

```bash
./scripts/cleanup.sh "src/utils/helpers.ts"
```

Output:

```
🧹 Starting code cleanup...
📁 Target: src/utils/helpers.ts

Step 1/3: Removing comments...
  Processing: src/utils/helpers.ts
    ✓ Cleaned (12.34% size reduction)
✅ Comment removal done

Step 2/3: Running ESLint with auto-fix...
✅ ESLint auto-fix done

Step 3/3: Running Prettier...
✅ Prettier formatting done

🎉 Code cleanup complete!
```

### Clean Multiple Files

```bash
./scripts/cleanup.sh "src/**/*.ts"
./scripts/cleanup.sh "tests/**/*.spec.ts,src/**/*.tsx"
```

### Clean a Directory

```bash
./scripts/cleanup.sh "src/pages/"
```

## Real-World Scenarios

### Scenario 1: Refactor Legacy Code

You're refactoring an older component with lots of outdated comments.

```typescript
// Before cleanup (with comments)
export class UserService {
  // Constructor - initializes the service
  // This handles dependency injection
  constructor(private http: HttpClient) {} // Takes HTTP client

  // Fetch all users from the API
  // Returns an Observable of users array
  // TODO: Add pagination support
  getUsers(): Observable<User[]> {
    // Make HTTP request to API endpoint
    return this.http.get<User[]>("/api/users");
  }
}
```

```bash
./scripts/cleanup.sh "src/services/user.service.ts"
```

```typescript
// After cleanup
export class UserService {
  constructor(private http: HttpClient) {}

  // TODO: Add pagination support
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>("/api/users");
  }
}
```

### Scenario 2: Prepare Code for Code Review

Before submitting a PR, clean up all files to meet project standards:

```bash
# Clean all source files in your branch
./scripts/cleanup.sh "src/**/*.{ts,tsx}"

# Verify no test issues
npm test

# Commit the cleanup
git add src/
git commit -m "refactor: clean up code formatting and remove comments"
git push
```

### Scenario 3: Standardize Test Files

Ensure all test files follow consistent formatting:

```bash
./scripts/cleanup.sh "tests/**/*.spec.ts"
```

The cleanup preserves important test markers:

```typescript
// Arrange - set up test data
const user = { id: 1, name: "John" };

// Act - execute the function
const result = filterUsers([user]);

// Assert - verify the result
expect(result).toHaveLength(1);
```

### Scenario 4: Bulk Project Cleanup

Clean your entire project after a major refactor:

```bash
# Clean source code
./scripts/cleanup.sh "src/**/*.{ts,tsx,js,jsx}"

# Clean tests
./scripts/cleanup.sh "tests/**/*.{ts,tsx,spec.ts}"

# Run full test suite to verify
npm test

# Create cleanup commit
git add .
git commit -m "refactor: code cleanup and formatting"
```

## Combining with Git Workflow

### Feature Branch Cleanup

```bash
# Make your changes, then clean up before merging
git checkout feature/my-feature
./scripts/cleanup.sh "src/**/*.ts"
git add .
git commit -m "refactor: code cleanup before PR"
git push
```

### Cleanup Specific Changes

```bash
# Show files changed in your branch
git diff --name-only main

# Clean only changed files
git diff --name-only main | xargs ./scripts/cleanup.sh

# Or with Prettier directly
git diff --name-only main | xargs npx prettier --write
```

## Performance Examples

### Processing Time Estimates

```bash
# Single file (100 lines)
time ./scripts/cleanup.sh "src/utils.ts"
# Real: 0m0.850s

# Small project (50 files)
time ./scripts/cleanup.sh "src/**/*.ts"
# Real: 0m3.200s

# Large project (500+ files)
time ./scripts/cleanup.sh "src/**/*.ts" "tests/**/*.ts"
# Real: 0m15.400s
```

### File Size Impact

Typical reductions from cleanup:

| Component            | Typical Reduction |
| -------------------- | ----------------- |
| Comment removal      | 10-30%            |
| Extra blank lines    | 2-5%              |
| Total size reduction | 12-35%            |

Example:

```
Before: 2,450 bytes
After:  1,890 bytes
Saved:  560 bytes (22.8% reduction)
```

## Troubleshooting Examples

### Issue: "glob module not found"

```bash
# Solution: Install glob for Node versions < 16.13
npm install --save-dev glob

# Verify installation
node -e "console.log(require('glob').sync('*.js'))"
```

### Issue: Files not being processed

```bash
# Verify pattern is correct
ls src/**/*.ts  # Check if files exist

# Use full path
./scripts/cleanup.sh "$(pwd)/src/**/*.ts"

# Check file permissions
ls -la .github/skills/code-cleanup/scripts/
# Should show: -rwxr-xr-x (executable)
```

### Issue: ESLint conflicts with Prettier output

```bash
# Install compatibility package
npm install --save-dev eslint-config-prettier

# Verify Prettier config
npx prettier --version
cat .prettierrc

# Run Prettier separately to check
npx prettier --write "src/test.ts"
npx eslint --fix "src/test.ts"
```

### Issue: Want to keep certain comments

Edit the `PRESERVE_MARKERS` array in `scripts/remove-comments.ts`:

```javascript
const PRESERVE_MARKERS = [
  "Arrange",
  "Act",
  "Assert",
  "TODO",
  "FIXME",
  "CUSTOM_MARKER", // Add your marker here
  "NOTE",
  "XXX",
  "WARN",
  "DEPRECATED",
];
```

## Best Practices

1. **Review before committing**: Always review cleanup results before committing
2. **Test after cleanup**: Run `npm test` to ensure functionality is preserved
3. **Use specific patterns**: Target specific directories rather than cleaning entire project at once
4. **Batch large cleanups**: Process large projects in logical batches
5. **Keep backups**: Use git branches during large cleanup operations
6. **Update .gitignore**: Exclude generated/built files from cleanup

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  cleanup-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm install

      - name: Run cleanup
        run: npm run cleanup -- "src/**/*.ts"

      - name: Check for differences
        run: git diff --exit-code || (echo "Run: npm run cleanup" && exit 1)
```

Add to `package.json`:

```json
{
  "scripts": {
    "cleanup": ".github/skills/code-cleanup/scripts/cleanup.sh"
  }
}
```
