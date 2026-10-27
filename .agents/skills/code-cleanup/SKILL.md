---
name: code-cleanup
type: skill
domain: code_quality
applies_to: [claude, copilot, codex, custom]
version: 1.0.0
task_types: [refactoring, code_formatting, lint_fixes]
depends_on: [static-code-analysis-typescript/SKILL.md]
status: stable
description: Removes obsolete code comments and applies configured linting and formatting.
---

# Code Cleanup

## Purpose

Perform focused cleanup using the repository's existing lint and formatting setup.

## Use When

Remove obsolete comments, fix lint/style issues, or format a controlled set of files. For behavioral changes or broad refactors, use the relevant implementation workflow.

## Inputs

Explicit target files/scope and repository lint/formatter configuration.

## Workflow

1. Inspect target files and tool configuration.
2. Remove redundant, obsolete, or commented-out code comments; preserve legal headers and documentation that carries useful information.
3. Run configured lint/format tools on the selected scope and review the diff for accidental changes.

## Rules

Keep cleanup separate from unrelated behavior changes. Do not invent or replace project rules, reformat unrelated files, or commit unless requested.

## Output

List changed files, tools/results, unresolved violations, and noteworthy diff.
