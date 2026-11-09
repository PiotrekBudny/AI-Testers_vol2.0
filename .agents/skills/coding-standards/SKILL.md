---
name: coding-standards
type: skill
domain: code
applies_to: [claude, copilot, codex, custom]
version: 1.0.0
task_types: [coding, test_implementation, code_review, refactoring]
depends_on: []
status: stable
description: Entry point for the repository-wide instructions in AGENTS.md.
---

# Coding Standards and Conventions

## Purpose

Provide a platform-loadable pointer to shared repository conventions. The authoritative rules are in the root [AGENTS.md](../../AGENTS.md).

## Use When

A task or integration explicitly requests this skill, or when another platform cannot load the root instructions automatically.

## Inputs

The root `AGENTS.md`, the applicable task-specific agent/skill, and current repository configuration.

## Workflow

Load and follow root `AGENTS.md`; then apply only the relevant task-specific guide. Keep shared rules in `AGENTS.md` rather than copying them into agent or skill files.

## Rules

This file is an index, not a second copy of repository standards.

## Output

No separate deliverable. Use the task-specific file's handoff format.
