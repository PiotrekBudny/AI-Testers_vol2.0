# Structure Summary

## Inventory

This repository currently has six root guides, seven agent definitions, and seven skill definitions.

- Guides: [README](./README.md), [Quick Start](./QUICK-START.md), [Integration Guide](./INTEGRATION-GUIDE.md), [Specification](./AGENT-SKILLS-SPEC.md), [Migration Summary](./MIGRATION-SUMMARY.md), and this file.
- Agents: [API Test Automation](./agents/api-test-automation.agent.md), [Explorer](./agents/explorer.agent.md), [QA Orchestrator](./agents/qa-orchestrator.agent.md), [Test Coder](./agents/test-coder.agent.md), [Test Framework Starter](./agents/test-framework-starter.agent.md), [Test Planner](./agents/test-planner.agent.md), and [UI Test Automation](./agents/ui-test-automation.agent.md).
- Skills: [API Testing](./skills/api-testing-skill/SKILL.md), [Code Cleanup](./skills/code-cleanup/SKILL.md), [Code Review](./skills/code-review/SKILL.md), [Coding Standards](./skills/coding-standards/SKILL.md), [Playwright CLI](./skills/playwright-cli/SKILL.md), [Playwright Test Workflow](./skills/playwright-test-workflow/SKILL.md), and [Static Code Analysis for TypeScript](./skills/static-code-analysis-typescript/SKILL.md).

## Workflow

For a broad testing effort, use the relevant parts of this sequence:

`Explore → Plan → Set up (if needed) → Implement → Report`

- Explorer maps behavior and risks.
- Test Planner turns evidence into prioritized coverage.
- Test Framework Starter assesses or repairs infrastructure only when needed.
- Test Coder implements planned cases; API and UI agents provide specialized patterns.
- QA Orchestrator coordinates broad work and synthesizes handoffs.

Skip stages outside the requested scope. Skills provide reusable procedures and conventions; see each agent's `depends_on` metadata for required skills.

## Format

Agents and skills share a YAML frontmatter schema and concise Markdown structure. See [AGENT-SKILLS-SPEC](./AGENT-SKILLS-SPEC.md). Platform configuration is required for automatic loading or invocation.
