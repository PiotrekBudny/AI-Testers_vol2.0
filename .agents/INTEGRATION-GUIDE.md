# Integration Guide

## Purpose

Explain how to make the agent and skill Markdown files available to an AI system. The files are portable instructions; YAML metadata alone does not enable automatic loading.

## Basic Setup

1. Keep `.agents/` in the repository.
2. Load root `AGENTS.md` as global repository context.
3. Select the agent for the task and include the skills listed in its `depends_on` metadata.
4. Configure repository instructions or a supported custom-agent mechanism to reference those files.
5. Confirm the platform actually loads the files; otherwise provide them in the conversation/context.

For the current file list, see [Structure Summary](./STRUCTURE-SUMMARY.md). For task-based selection, see [Quick Start](./QUICK-START.md).

## Platform Approaches

### Repository-aware assistants

Reference the relevant paths from the platform's supported repository instruction/configuration file. Keep references task-specific and follow the platform's own syntax for custom agents or commands. Do not assume `/agents:<name>` or automatic dependency loading is available.

### Chat or file-upload workflows

Provide the relevant agent and skill Markdown files with the task. State which agent/skill to follow and include requirements, target files, and expected behavior.

### Custom loaders

A loader can discover `agents/*.agent.md` and `skills/*/SKILL.md`, parse the YAML frontmatter, filter by `applies_to` and `task_types`, and load referenced dependencies. Resolve `depends_on` entries as paths relative to `.agents/skills/`; validate missing `SKILL.md` files and avoid recursive cycles.

## Metadata

The shared schema is documented in [AGENT-SKILLS-SPEC.md](./AGENT-SKILLS-SPEC.md). In brief:

- `type` identifies an agent or skill.
- `applies_to` identifies intended platforms.
- `task_types` supports task selection.
- `depends_on` lists required skill paths relative to `.agents/skills/`.
- `version` and `status` describe the document.

## Troubleshooting

- **A file is not loaded:** Check its path, platform configuration, and whether the platform supports repository context.
- **A dependency is missing:** Compare `depends_on` with paths in `.agents/skills/`; use folder paths, not display names.
- **An invocation command fails:** Check platform-specific syntax; the Markdown filename does not create a slash command.
- **Context is too large:** Load only the relevant agent and its required skills.

## Maintenance

Update definitions when repository conventions change. Keep paths, dependencies, tags, and platform examples accurate; increment the document version when the content contract changes. Verify links and dependency paths after edits.
