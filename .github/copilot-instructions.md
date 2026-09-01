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
