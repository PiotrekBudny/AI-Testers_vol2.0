---
name: api-testing-skill
type: skill
domain: testing
applies_to: [claude, copilot, codex, custom]
version: 1.0.0
task_types: [api_testing, api_automation, api_debugging]
depends_on: []
status: stable
description: Patterns for exploring, authoring, and maintaining REST API tests with Playwright.
---

# API Testing

## Purpose

Provide API-specific workflows and patterns for Playwright's `request` fixture. Follow the root [AGENTS.md](../../../AGENTS.md) for shared repository conventions.

## Use When

Explore or implement REST endpoint tests, clients, fixtures, factories, response helpers, and API debugging.

## Inputs

API contract or observed behavior, target environment, auth/data needs, and existing API specs/support code.

## Workflow

1. Review the relevant implementation and support code before planning changes: routes or API handlers when available, clients, fixtures, factories, types, existing specs, and configuration. Read the API docs/spec too. Record methods, paths, params, request/response shapes, status codes, auth, validation, rate limits, models, and unknowns.
2. Design representative exploratory probes for success, error, authentication, and relevant boundary/filter/pagination behavior. Keep probes independent and prefer read-only requests; use disposable data for state-changing requests.
3. Execute exploratory API requests against the configured target environment before implementing or changing tests, clients, fixtures, factories, or helpers. Use Playwright's `request` fixture where practical. Record the observed request/response behavior and compare it with the documented contract and existing code. If exploration cannot be run (for example, the service or required credentials are unavailable), report the blocker and do not start implementation until exploration is possible or the user changes the requirement.
4. Turn the observed behavior and remaining contract gaps into a focused test plan. Keep formal test cases minimally dependent on one another.
5. Use Playwright's `request` fixture in tests. Create resource clients to centralize URL/header behavior when useful; return raw `APIResponse` for parsing/assertions in tests.
6. Parse with the repository's typed response helper (for example, `readApiResponse<T>()`). Add focused assertion helpers for repeated or complex contracts.
7. Use factories with partial overrides. A disposable request context can isolate setup from the shared request fixture's auth/cookie state.
8. Use fixtures for shared auth lifecycle; keep missing/invalid-auth cases separate from valid-auth coverage.
9. Review the resulting diff against the observed contract and repository patterns. Check that tests assert meaningful status, response structure, and error behavior, and that support code does not hide assertions or introduce unnecessary abstractions.

## Rules

- Validate status, response structure, and relevant error contract.
- Exploratory API testing is a required pre-implementation step, not a substitute for the committed automated tests. Do not infer runtime behavior solely from documentation or existing test expectations.
- Review both the existing code before changing it and the final implementation diff; call out mismatches between observed behavior, documentation, and code.
- Group support by concern and specs by endpoint/feature. Prefer a helper for one-off calls; consider a client when several tests share endpoint logic.
- Do not use the browser `page` fixture for direct API tests or introduce a mock server as a substitute for testing the real contract.

## Output

Provide planned/implemented cases, files/support code, configuration needs, observed contract questions, and validation results.
