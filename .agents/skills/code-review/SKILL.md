---
name: code-review
type: skill
domain: code_quality
applies_to: [claude, copilot, codex, custom]
version: 1.0.0
task_types: [review, quality_assurance, risk_assessment]
depends_on: []
status: stable
description: Performs a concise review of focused changes for defects, tests, and visible risks.
---

# Code Review

## Purpose

Find actionable defects or risks in a focused diff or file and report them with evidence. Use root `AGENTS.md` as the shared repository baseline.

## Use When

Review a small diff, single file, or focused change (roughly under 500 lines). Large architectural changes, security-sensitive code, or complex suites need a deeper specialist review.

## Inputs

Diff/target files, intended behavior, requirements, and relevant surrounding code.

## Workflow

1. Understand the intended behavior and scope.
2. Inspect for correctness, boundary cases, types/API usage, async/error handling, compatibility, data-loss risks, performance, dependencies, and related tests.
3. Report actionable findings in severity order, with file/line, impact, and concrete fix. If none, say so and state material review limits.

## Rules

Prioritize Critical (security/core behavior/data loss), High (major logic/test/performance), Medium (meaningful maintainability/coverage), and Low (minor edge/style) findings. Distinguish confirmed defects from questions or suggestions. Do not modify code unless asked to fix it.

## Output

Give a brief scope/summary, findings by severity with locations and fixes, checks observed or missing, and a verdict: ready, needs review, or changes requested.
