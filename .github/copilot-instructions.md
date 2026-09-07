# Copilot Instructions

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Rules:**

- Imperative, present tense, lowercase, no period at the end.
- Keep the summary to 72 characters or less.
- Add a scope when the change is limited to one area (e.g. `fix(playwright-config): ...`).

**Example:**

```
feat(tests): add smoke test for login flow
```

## Coding Standards

See [coding-standards.md](../coding-standards.md) for page object conventions, test structure (Arrange/Act/Assert), and test tagging rules.

## Comments

Do not add comments to code, except for the `// Arrange`, `// Act`, and `// Assert` markers required in test bodies.

## Environment Variables & Credentials

**Never read or reference the `.env` file.** Use `#file:.env.ai` instead when accessing credentials and configuration for AI-related tasks.

- `.env` is for runtime application use only
- `.env.ai` contains credentials specifically for AI operations
- Always reference `#file:.env.ai` when you need to access sensitive information for automation or testing

## Playwright MCP Output

All Playwright MCP browser snapshots and screenshots are automatically stored in the `.playwright-mcp/` directory (configured via `.vscode/mcp.json` with `--output-dir=.playwright-mcp`).

- **Output location**: `.playwright-mcp/` (gitignored, not tracked in version control)
- **When creating snapshots/screenshots**: Use descriptive filenames (e.g., `homepage-snapshot.md`, `login-flow.png`)
- **Automatic handling**: Do not manually specify paths; the configured output directory handles storage
- Example: `mcp_playwright_browser_snapshot({ filename: "homepage-snapshot.md" })`
