# Migration Summary

## Purpose

Historical note for the move to the shared `.agents/` format. For the current file list and counts, use [Structure Summary](./STRUCTURE-SUMMARY.md).

## Verified Migration

Git records commit `a97bc25` on 2026-10-19 as `feat(.agents): migrate all skills and agents to universal structure`.

That commit added the Explorer, QA Orchestrator, Test Coder, and Test Framework Starter agents; added or migrated skill documents; and introduced the shared YAML frontmatter convention. It also updated the Playwright workflow and added a root `SKILL.md`. Existing API/UI/planning agents and repository guides were part of the broader framework and were maintained in later commits.

## Migration Goals

- Keep agent and skill definitions together under `.agents/`.
- Use consistent metadata for discovery and dependency references.
- Reuse skills across focused agents.
- Preserve links to repository conventions and test workflows.

## Current Source of Truth

- Current inventory and roles: [Structure Summary](./STRUCTURE-SUMMARY.md).
- Frontmatter and authoring conventions: [Specification](./AGENT-SKILLS-SPEC.md).
- Integration guidance: [Integration Guide](./INTEGRATION-GUIDE.md).

This file records the migration context; it does not certify current platform compatibility or claim that legacy copies have been removed.
