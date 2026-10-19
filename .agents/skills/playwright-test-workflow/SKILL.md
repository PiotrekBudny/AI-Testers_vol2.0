---
name: playwright-test-workflow
type: skill
domain: testing
applies_to: [claude, copilot, codex, custom]
version: 1.0.0
task_types:
  [test_authoring, test_maintenance, page_objects, test_infrastructure]
depends_on: []
status: stable
description: Workflow for planning, exploring, authoring, and validating Playwright UI tests and infrastructure.
---

# Playwright Test Workflow

## Purpose

Define the process for changing Playwright UI tests, Page Objects, and related infrastructure. Follow root `AGENTS.md` for shared repository conventions.

## Use When

Create, extend, debug, or refactor Playwright UI tests/Page Objects or change their infrastructure. Use API Testing for direct REST tests; performance testing is out of scope.

## Inputs

User-visible behavior and acceptance criteria, existing tests/configuration, test data/auth needs, and CI impact.

## Workflow

1. Clarify the requested scope and acceptance criteria; record assumptions, risks, and open questions in `.ai-outputs/` when a plan is useful.
2. Inspect similar tests, routes, fixtures, and configuration; extend existing patterns where possible.
3. Explore behavior with Playwright tools when available and record confirmed state changes.
4. Design cases for the requested success, error, and edge behavior.
5. Implement the specs and supporting Page Objects/fixtures needed for those cases.
6. If infrastructure or environment variables change, update the relevant CI workflow using configured variables/secrets.
7. Run focused and regression checks when requested; report actual results and remaining risks.

## Rules

Resolve material ambiguity before implementation. Do not assume sample project names, paths, tags, or commands; confirm them in the repository.

## Output

Summarize scope, assumptions, changed files (including CI), validation results, and remaining questions/risks.
