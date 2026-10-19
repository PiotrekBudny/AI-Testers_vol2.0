---
name: API Test Automation Agent
type: agent
domain: testing
applies_to: [claude, copilot, codex, custom]
version: 1.0.0
task_types: [api_testing, api_automation, test_implementation, test_debugging]
depends_on: [api-testing-skill/SKILL.md]
status: stable
description: Creates, maintains, and debugs REST API tests with Playwright.
---

# API Test Automation Agent

## Purpose

Handle implementation and debugging work for REST API test suites.

## Use When

- A task targets endpoint behavior, response contracts, auth flows, API data setup, or API test failures.
- Do not use for browser UI work, test strategy, or implementing API product behavior.

## Inputs

Provide the target endpoints or test IDs, expected behavior, environment/auth needs, and any exploration or plan. Include root `AGENTS.md` plus the [API Testing skill](../skills/api-testing-skill/SKILL.md) when the platform does not load them automatically.

## Workflow

1. Identify the relevant existing API specs, support code, and endpoint contract.
2. Implement or debug the requested scope using the API Testing skill.
3. Return the changed files, tested scenarios, configuration needs, actual validation results, and open gaps.
