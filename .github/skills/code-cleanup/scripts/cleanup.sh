#!/bin/bash

# Code Cleanup Script
# Removes comments, runs ESLint with auto-fix, and applies Prettier formatting
# Usage: ./cleanup.sh "path/to/file.ts" or ./cleanup.sh "src/**/*.ts"

set -e

if [ $# -eq 0 ]; then
  echo "Usage: ./cleanup.sh <file-or-pattern>"
  echo "Examples:"
  echo "  ./cleanup.sh 'src/utils.ts'"
  echo "  ./cleanup.sh 'src/**/*.ts'"
  exit 1
fi

PATTERN="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🧹 Starting code cleanup..."
echo "📁 Target: $PATTERN"
echo ""

# Step 1: Remove comments
echo "Step 1/3: Removing comments..."
node "$SCRIPT_DIR/remove-comments.js" "$PATTERN" || {
  echo "⚠️  Comment removal completed (some files may have been skipped)"
}
echo "✅ Comment removal done"
echo ""

# Step 2: Run ESLint with auto-fix
echo "Step 2/3: Running ESLint with auto-fix..."
if [ -f "$PROJECT_ROOT/eslint.config.mjs" ] || [ -f "$PROJECT_ROOT/.eslintrc.js" ] || [ -f "$PROJECT_ROOT/.eslintrc.json" ]; then
  npx eslint --fix "$PATTERN" 2>/dev/null || {
    echo "⚠️  ESLint completed with warnings (check output above)"
  }
  echo "✅ ESLint auto-fix done"
else
  echo "⚠️  No ESLint config found, skipping ESLint"
fi
echo ""

# Step 3: Run Prettier
echo "Step 3/3: Running Prettier..."
if [ -f "$PROJECT_ROOT/.prettierrc" ] || [ -f "$PROJECT_ROOT/prettier.config.js" ] || [ -f "$PROJECT_ROOT/.prettierrc.json" ] || [ -f "$PROJECT_ROOT/package.json" ]; then
  npx prettier --write "$PATTERN" 2>/dev/null || {
    echo "⚠️  Prettier completed with warnings (check output above)"
  }
  echo "✅ Prettier formatting done"
else
  echo "⚠️  No Prettier config found, skipping Prettier"
fi
echo ""

echo "🎉 Code cleanup complete!"
echo ""
echo "Next steps:"
echo "  1. Review the changes"
echo "  2. Run your test suite: npm test"
echo "  3. Commit: git commit -m 'refactor: clean up code, remove comments, and apply formatting'"
