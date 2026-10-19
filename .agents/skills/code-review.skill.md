---
name: code-review
type: skill
domain: code-quality
applies_to: [Claude, Copilot, codex, custom]
version: 1.0.0
task_types: [review, quality-assurance, risk-assessment]
depends_on: [coding-standards]
status: stable
description: Quick, lightweight review of small diffs or single files for correctness, readability, tests, and obvious risks.
---

# Code Review Skill

Performs a quick, lightweight review of a small diff or single file, giving concise feedback on correctness, readability, tests, and obvious risks.

## When to Use

- Fast sanity-check review of a small change (< 500 LOC)
- Reviewing a single file or a focused PR
- Quick feedback on correctness and readability before formal review
- Identifying obvious risks or bugs
- Checking test coverage of new code

## When NOT to Use

- Large multi-file refactors or architectural changes — use code-review-advanced
- Security-sensitive paths — use security-review
- Complex test-automation suites — use code-review-advanced
- When deep architectural knowledge is needed

## Review Checklist

### 1. Correctness

- [ ] Logic is sound and handles edge cases
- [ ] No obvious off-by-one errors or type mismatches
- [ ] API usage is correct (methods, parameters, return types)
- [ ] No unhandled promise rejections or async issues
- [ ] Error handling is present where needed

### 2. Readability

- [ ] Variable/function names are clear and descriptive
- [ ] Code structure is logical and follows project patterns
- [ ] No unnecessary complexity or over-engineering
- [ ] Comments explain "why", not "what"
- [ ] Code aligns with repository conventions (see `coding-standards.md`)

### 3. Tests

- [ ] New code has corresponding tests
- [ ] Tests follow Arrange/Act/Assert pattern
- [ ] Test names describe what is being tested
- [ ] Happy path and edge cases are covered
- [ ] No skipped or commented-out tests

### 4. Risks & Dependencies

- [ ] No breaking changes to existing APIs
- [ ] No silent failures or data loss scenarios
- [ ] Dependencies are up-to-date and secure
- [ ] Performance impact is acceptable
- [ ] No dead code left behind

### 5. Style

- [ ] Code formatting matches project standards
- [ ] Imports are organized correctly
- [ ] No console.log or debug statements left in
- [ ] Follows naming conventions
- [ ] Commit message follows conventional commits

## Review Output Format

```markdown
## ✅ Summary

[1-2 sentence overview of changes and overall assessment]

## 🎯 Strengths

- [Specific positive aspect]
- [Well-implemented feature]

## ⚠️ Issues Found

### [Severity] [Issue Title]

- **Location**: File.ts:42
- **Description**: [What's wrong and why it matters]
- **Suggestion**: [How to fix it]

### [Severity] [Issue Title]

- **Location**: spec.ts:15-22
- **Description**: [What's wrong]
- **Suggestion**: [How to fix]

## 📋 Checklist

- [x] Correctness verified
- [x] Readability acceptable
- [ ] Tests present but incomplete (see issue above)
- [x] No obvious risks
- [x] Style compliant

## 👍 Verdict

[Ready to merge] / [Needs review] / [Changes requested]
```

## Severity Levels

- **Critical**: Breaks functionality, security issue, or data loss risk
- **High**: Significant logic error, missing test coverage, or performance problem
- **Medium**: Improves readability, maintainability, or style consistency
- **Low**: Nitpicks, edge cases, or subjective style preferences

## Examples

### Example 1: Straightforward PR

```markdown
## ✅ Summary

Adds filtering to product list endpoint. Well-structured, properly tested.

## 🎯 Strengths

- Clear separation of concerns between route and filter logic
- Good test coverage with happy path and edge cases
- Follows existing patterns in the codebase

## ⚠️ Issues Found

None

## 📋 Checklist

- [x] Correctness verified
- [x] Readability acceptable
- [x] Tests present and complete
- [x] No obvious risks
- [x] Style compliant

## 👍 Verdict

✅ Ready to merge
```

### Example 2: Issues Identified

```markdown
## ✅ Summary

API client refactor reduces duplication. Mostly good, but a few risks to address.

## 🎯 Strengths

- Eliminates 200 lines of repeated code
- Better error handling than original
- Comprehensive tests for new patterns

## ⚠️ Issues Found

### 🔴 Critical: Missing error handling

- **Location**: client.ts:45-52
- **Description**: Network timeouts not caught; will crash the app
- **Suggestion**: Wrap fetch in try/catch, return structured error response

### 🟡 Medium: Test tag missing

- **Location**: client.spec.ts:12
- **Description**: Integration test not tagged as `@slow`; may fail in quick CI runs
- **Suggestion**: Add `@slow` tag or split into unit and integration tests

## 👍 Verdict

🔧 Changes requested (fix critical issue, then re-review)
```

## Related Skills

- **coding-standards** — Project-specific conventions and patterns
- **security-review** — Deep-dive security assessment
- **static-code-analysis-typescript** — Automated lint and type checking
