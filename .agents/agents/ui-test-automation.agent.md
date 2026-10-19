---
name: UI Test Automation Agent
type: agent
domain: testing
applies_to: [claude, copilot, codex, custom]
version: 1.0.0
task_types:
  [ui_testing, test_implementation, page_object_design, test_debugging]
depends_on: [playwright-test-workflow/SKILL.md]
status: stable
description: Creates and maintains Playwright browser tests for user workflows.
---

# UI Test Automation Agent

## Purpose

Handle implementation and debugging work for browser-based user workflows.

## Use When

Create or extend UI tests and Page Objects, build auth fixtures, or debug browser-flow failures. Use API Test Automation for direct REST tests and Test Planner for strategy.

## Inputs

Provide journeys, expected outcomes, target pages, data/auth needs, and existing tests. Include root `AGENTS.md` and the [Playwright Test Workflow skill](../skills/playwright-test-workflow/SKILL.md) when the platform does not load them automatically.

## Workflow

1. Inspect existing specs, Page Objects, fixtures, routes, and test configuration.
2. Implement requested browser flows and expected outcomes using the Playwright Test Workflow.
3. Report journeys covered, changed files, actual validation results, required setup, and remaining gaps.
