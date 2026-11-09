---
name: static-code-analysis-typescript
type: skill
domain: code_quality
applies_to: [claude, copilot, codex, custom]
version: 1.0.0
task_types: [code_quality, tooling_setup, ci_configuration]
depends_on: []
status: stable
description: Sets up, reviews, or modernizes linting, type checking, formatting, and CI quality gates for Node.js/TypeScript.
---

# Static Code Analysis for TypeScript

## Purpose

Provide automated quality checks for TypeScript projects, tailored to existing tools and repository needs.

## Use When

Set up or modernize ESLint, TypeScript checks, Prettier, import sorting, pre-commit hooks, or CI quality gates; fix lint/type errors; or audit current tooling.

## Inputs

Current package/runtime, scripts/config, CI, conventions, and desired quality gates. Follow root `AGENTS.md`.

## Workflow

1. Assess existing tools, versions, configs, hooks, CI, and package scripts.
2. Design the smallest useful change. A common baseline is ESLint with `typescript-eslint`, `tsc --noEmit`, and Prettier; import sorting and staged-file hooks are optional.
3. Align TypeScript strictness and file scopes with the project; exclude generated, dependency, and build directories. Keep formatting rules in Prettier.
4. Add or update scripts and CI quality jobs using the supported runtime, package manager, and lockfile.
5. Validate configured checks and distinguish existing code violations from configuration failures.

## Rules

Inspect before editing; do not add duplicate tools or rewrite a working setup without need. Treat example configs and dependencies as options, not requirements.

## Output

Summarize current state, design choices, changed files/dependencies/scripts/workflows, validation results, and remaining issues.
