# Agent and Skill Format Specification

## Purpose

Define the common metadata and content conventions for files under `.agents/agents/` and `.agents/skills/`. These Markdown files are portable instructions; consuming platforms decide how to load and apply them.

## Frontmatter

Every agent and skill uses this YAML frontmatter schema:

```yaml
---
name: Human-readable name
type: agent
domain: testing
applies_to: [claude, copilot, codex, custom]
version: 1.0.0
task_types: [api_testing, test_implementation]
depends_on: [api-testing-skill/SKILL.md]
status: stable
description: One-sentence purpose.
---
```

Use `type: skill` for skills. All fields are present in the current files. `depends_on` contains skill paths relative to `.agents/skills/`; use an empty list when there are no dependencies. Keep values concise and consistent.

| Field         | Meaning                                                                              |
| ------------- | ------------------------------------------------------------------------------------ |
| `name`        | Display name for agents; kebab-case skill identifier matching its folder for skills. |
| `type`        | `agent` or `skill`.                                                                  |
| `domain`      | Main work area, such as testing, planning, code, or code_quality.                    |
| `applies_to`  | Intended AI platforms; lowercase identifiers.                                        |
| `version`     | Version of the instruction document.                                                 |
| `task_types`  | Task categories used for selection.                                                  |
| `depends_on`  | Required skill paths relative to `.agents/skills/`.                                  |
| `status`      | Maturity, currently `stable`.                                                        |
| `description` | Short summary for discovery.                                                         |

## Skill Directory Layout

Skills live in `.agents/skills/<skill-name>/SKILL.md`, and the frontmatter `name` matches `<skill-name>`. Agent definitions remain under `.agents/agents/` and do not use the skill directory layout.

## Agent Content

Use these sections in order:

1. `# [Agent Name]`
2. `## Purpose`
3. `## Use When`
4. `## Inputs`
5. `## Workflow`
6. `## Rules`
7. `## Handoff`

Describe the agent's responsibility and scope, required context/skills, actionable steps, constraints, and handoff information. Keep examples only when they clarify a non-obvious decision.

## Skill Content

Use these sections in order:

1. `# [Skill Name]`
2. `## Purpose`
3. `## Use When`
4. `## Inputs`
5. `## Workflow`
6. `## Rules`
7. `## Output`

Document reusable procedures and constraints. Keep commands or examples when they are needed to use the skill; remove repeated sample conversations and boilerplate.

## Naming and Dependencies

- Agent filename: `<name>.agent.md`; skill path: `<name>/SKILL.md`.
- Use lowercase kebab-case folder names for skills and task-type identifiers.
- Dependencies refer to skill paths relative to `.agents/skills/`, not display names.
- Keep the dependency graph shallow and check that every referenced file exists.
- Cross-link related files with relative Markdown links where helpful.

## Loading

A capable loader may discover files by suffix, parse frontmatter, filter by `applies_to` or `task_types`, and load skill dependencies. This behavior is platform-specific and is not guaranteed by the file format. Load the repository root `AGENTS.md` as shared context before task-specific agents and skills.
