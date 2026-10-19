---
name: playwright-cli
type: skill
domain: testing
applies_to: [Claude, Copilot, codex, custom]
version: 1.0.0
task_types: [browser-automation, test-exploration, page-inspection]
depends_on: []
status: stable
description: Browser automation with Playwright CLI for interactive test development, exploration, and validation.
---

# Playwright CLI Skill

Automate browser interactions, test web pages and work with Playwright tests using the Playwright CLI.

## When to Use

- Exploring and understanding page structure during test development
- Interactive debugging of tests
- Quick validation of UI behavior
- Taking snapshots and screenshots for documentation
- Testing page navigation and interactions before writing test code
- Recording interactions for test generation

## Quick Start

```bash
# Open new browser
playwright open

# Navigate to a page
playwright goto https://playwright.dev

# Interact with the page using refs from the snapshot
playwright click e15
playwright type "search query"
playwright press Enter

# Take a snapshot to see page structure
playwright snapshot

# Close the browser
playwright close
```

## Core Commands

### Navigation

```bash
# Open browser and navigate
playwright open https://example.com/
playwright goto https://playwright.dev

# Navigate without arguments
playwright go-back
playwright go-forward
playwright reload
```

### Interaction

```bash
# Click and double-click
playwright click e3
playwright dblclick e7

# Type and fill text
playwright type "search query"
playwright fill e5 "user@example.com" --submit

# Drag and drop
playwright drag e2 e8

# Drop files or data
playwright drop e4 --path=./image.png
playwright drop e4 --data="text/plain=hello world"

# Hover over element
playwright hover e4

# Select option from dropdown
playwright select e9 "option-value"

# Upload files
playwright upload ./document.pdf

# Check/uncheck checkbox
playwright check e12
playwright uncheck e12
```

### Keyboard & Mouse

```bash
# Press keys
playwright press Enter
playwright press ArrowDown
playwright press Tab

# Keyboard modifiers
playwright keydown Shift
playwright keyup Shift

# Mouse movement
playwright mousemove 150 300
playwright mousedown
playwright mouseup
playwright mousewheel 0 100
```

### Page Inspection

```bash
# Snapshot shows page structure with element references
playwright snapshot

# Find text or regex in snapshot
playwright find "Sign in"
playwright find --regex "Sign (in|up)"
playwright find --regex "/sign (in|up)/i"

# Evaluate JavaScript
playwright eval "document.title"
playwright eval "el => el.textContent" e5
playwright eval "el => el.getAttribute('data-testid')" e5

# Get element details
playwright eval "el => el.id" e5
playwright eval "el => el.className" e5
```

### Dialogs

```bash
# Handle dialogs
playwright dialog-accept
playwright dialog-accept "confirmation text"
playwright dialog-dismiss
```

### Screenshots & Recording

```bash
# Full page screenshot
playwright screenshot

# Element screenshot
playwright screenshot e5

# Save with custom filename
playwright screenshot --filename=page.png

# Video recording
playwright start-recording
playwright stop-recording --output=recording.webm
```

### Window Management

```bash
# Resize browser
playwright resize 1920 1080

# Close browser
playwright close
```

## Element References

When using `playwright snapshot`, elements are assigned short references (e.g., `e1`, `e2`, etc.).

Use these references in commands:

```bash
# These refer to elements from the snapshot
playwright click e15
playwright fill e5 "text"
playwright eval "el => el.value" e3
```

**Re-run `snapshot` after page navigation** to get updated element references.

## Workflow Example

### 1. Explore a Page

```bash
# Open browser and navigate
playwright open https://app.example.com/login

# Take snapshot to see structure
playwright snapshot

# Find the login button
playwright find "Sign In"
```

### 2. Interact with Elements

```bash
# Fill login form
playwright fill e1 "user@example.com"
playwright fill e2 "password123"

# Click submit
playwright click e3

# Wait for navigation
playwright wait-for-url "**/dashboard"
playwright snapshot
```

### 3. Verify Results

```bash
# Check for success message
playwright find "Welcome back"

# Take screenshot for documentation
playwright screenshot --filename=login-success.png
```

### 4. Close Browser

```bash
playwright close
```

## Advanced Usage

### Conditional Actions

```bash
# Check if element exists before clicking
playwright find "Logout" && playwright click e10

# Try different selectors
playwright find "Sign in" || playwright find "Login"
```

### Data Validation

```bash
# Extract and verify element text
playwright eval "el => el.textContent" e5

# Check element visibility
playwright eval "el => el.offsetHeight > 0" e5

# Verify href attribute
playwright eval "el => el.href" e8
```

### Form Interactions

```bash
# Fill and submit form in one command
playwright fill e1 "user@example.com" --submit

# Multi-step form filling
playwright fill e1 "John"
playwright fill e2 "Doe"
playwright fill e3 "john@example.com"
playwright click e4  # Submit button
```

## Snapshot Output Format

The snapshot shows the page accessibility tree with:

- Element type (button, input, link, etc.)
- Element reference (e.g., `e15`)
- Visible text or label
- Role and attributes

Example:

```
Button
  e15 "Search"
    role: "button"
    aria-label: "Search documentation"

TextBox
  e1 "Username"
    role: "textbox"
    aria-label: "Enter your username"
```

## Tips & Tricks

1. **Use snapshots liberally** — They show the current state and element references
2. **Re-run after navigation** — Page changes require new snapshots for current references
3. **Use find() first** — Locate elements by text before getting references
4. **Chain commands** — Use && to run commands conditionally
5. **Take screenshots** — Document UI state for test planning
6. **Test selectors** — Verify locators work before using in tests

## Troubleshooting

### Element reference not found

If `e15` doesn't exist after taking a snapshot:

- Take a fresh snapshot with `playwright snapshot`
- The page may have changed; references are only valid for the current state

### Command hangs or times out

```bash
# Try with explicit timeout
playwright goto https://example.com --timeout=30000

# Check page state
playwright snapshot
```

### Can't find element by text

```bash
# Use find with regex for more flexible matching
playwright find --regex "/exact text/i"

# Take snapshot to see actual element text
playwright snapshot
```

## Integration with Test Code

Use CLI exploration to understand the page, then write Playwright test code:

```typescript
// From CLI: found element by text "Search", ref e15
// Create Page Object for reuse:
export class SearchPage {
  async search(query: string) {
    await this.page.fill('[data-testid="search-input"]', query);
    await this.page.click('button:has-text("Search")');
  }
}

// Use in test spec
test("User can search products", async ({ page }) => {
  const searchPage = new SearchPage(page);
  await searchPage.search("laptop");
  // ... assertions
});
```

## Related Skills

- **playwright-test-workflow** — Full end-to-end test authoring workflow
- **api-testing** — Testing REST APIs (doesn't require browser automation)
