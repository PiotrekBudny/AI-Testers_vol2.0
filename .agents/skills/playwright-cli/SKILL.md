---
name: playwright-cli
type: skill
domain: testing
applies_to: [claude, copilot, codex, custom]
version: 1.0.0
task_types: [browser_automation, test_exploration, page_inspection]
depends_on: []
status: stable
description: Uses the Playwright CLI for interactive browser exploration, inspection, and validation.
---

# Playwright CLI

## Purpose

Explore live web pages and confirm UI behavior before creating or debugging automated tests. Follow root `AGENTS.md` for shared repository rules.

## Use When

Inspect page structure, navigation, forms, or interactions; debug a UI flow; or capture a screenshot/recording.

## Inputs

Target URL, flow to inspect, and available test account/data.

## Workflow

1. Open the browser at the target, then run `playwright snapshot` to inspect the accessibility tree and element references.
2. Find controls and interact using current snapshot references. Refresh the snapshot after navigation or substantial state changes.
3. Inspect state/text/attributes with `playwright eval`; capture screenshots/recordings when useful.
4. Close the browser and pass observed behavior/locators to the test author.

## Rules

Use evaluation only to inspect the page, not to bypass app behavior or expose secrets. Treat observations as specific to the inspected state/environment.

## Command Reference

- Navigation: `playwright open <url>`, `goto <url>`, `go-back`, `go-forward`, `reload`.
- Inspect: `snapshot`, `find <text>`, `find --regex <pattern>`, `eval <expression> [ref]`.
- Interact: `click <ref>`, `dblclick <ref>`, `fill <ref> <text> [--submit]`, `type <text>`, `press <key>`, `hover <ref>`, `select <ref> <value>`, `check/uncheck <ref>`.
- Other: `drag <from> <to>`, `drop <ref> --path=<file>`, `upload <file>`, `dialog-accept/dismiss`, `resize <width> <height>`.
- Evidence/lifecycle: `screenshot [ref] [--filename=<file>]`, `start-recording`, `stop-recording --output=<file>`, `close`.

## Output

Record the inspected flow, observed state, useful selectors, created artifacts, and environment limitations.
