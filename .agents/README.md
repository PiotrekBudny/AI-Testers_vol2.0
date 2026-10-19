# Agent and Skill Guide

## Purpose

This directory contains reusable agent instructions and skills for AI-assisted testing and code quality work in this repository.

Agent and skill files are Markdown with YAML frontmatter. They provide context; support for automatic discovery or invocation depends on the AI platform and its configuration.

The root [`AGENTS.md`](../AGENTS.md) is the single source for repository-wide instructions. Include it as global context when using these files outside an environment that loads it automatically.

## Current Structure

- `agents/`: seven focused roles for exploration, planning, framework setup, test implementation, API/UI automation, and orchestration.
- `skills/`: seven reusable guides for API testing, Playwright, coding standards, cleanup, review, and TypeScript quality tooling.
- `AGENT-SKILLS-SPEC.md`: metadata and authoring conventions.
- `QUICK-START.md`: choose files for a task.
- `INTEGRATION-GUIDE.md`: load these files in an AI system.
- `STRUCTURE-SUMMARY.md`: inventory and workflow.
- `MIGRATION-SUMMARY.md`: migration history.

## How to Use

1. Choose the agent or skill for the task.
2. Include its file and any dependencies in the AI context, or configure the platform to reference them.
3. Follow repository instructions and the selected file's workflow.

YAML metadata does not by itself make a platform load a file. Check the platform's supported configuration and invocation method.

## Metadata

All current agent and skill files use the same fields: `name`, `type`, `domain`, `applies_to`, `version`, `task_types`, `depends_on`, `status`, and `description`. See the [specification](./AGENT-SKILLS-SPEC.md).

## Related Guides

- [Quick Start](./QUICK-START.md)
- [Integration Guide](./INTEGRATION-GUIDE.md)
- [Agents](./agents/)
- [Skills](./skills/)
- [Repository-wide instructions](../AGENTS.md)
