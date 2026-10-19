# Agent & Skills Configuration

This directory contains universal AI agent and skills definitions designed to work across Claude Codex, GitHub Copilot, and other AI systems.

## Directory Structure

```
.agents/
├── README.md                          # This file
├── AGENT-SKILLS-SPEC.md              # Universal agent-skills specification
├── agents/
│   ├── test-planner.agent.md          # Test planning agent
│   ├── api-test-automation.agent.md   # API test automation agent
│   └── ui-test-automation.agent.md    # UI test automation agent
└── skills/
    ├── api-testing.skill.md           # API testing skill
    ├── ui-testing.skill.md            # UI testing skill
    ├── test-planning.skill.md         # Test planning skill
    └── coding-standards.skill.md      # Coding standards & conventions
```

## What Are Agents?

Agents are specialized AI personas configured for specific tasks:

- **Test Planner**: Designs test strategies and test cases
- **API Test Automation**: Creates and maintains API tests
- **UI Test Automation**: Creates and maintains Playwright UI tests

## What Are Skills?

Skills document domain knowledge, patterns, and best practices:

- **API Testing**: Patterns, helpers, and best practices for API testing
- **UI Testing**: Page object model, locators, and test structure
- **Test Planning**: Test case design, coverage strategies, tagging
- **Coding Standards**: Repository conventions, code organization, naming

## How to Use

### For Copilot Users

1. Place `.agents/` directory in repository root
2. Create `.github/copilot-instructions.md` with agent references
3. Place skill files in `.agents/skills/`

### For Claude Codex / Claude Web

1. Reference specific skill files in the system prompt
2. Use agent definitions as custom instructions
3. Include relevant skills in context for specific tasks

### For Custom AI Integration

1. Parse `.agent.md` and `.skill.md` files
2. Extract metadata from YAML frontmatter
3. Load relevant skills based on task type
4. Use as context in system prompt

## Integration Examples

### Copilot Example

```yaml
# .github/copilot-instructions.md
See .agents/AGENT-SKILLS-SPEC.md for universal format
Load skills from .agents/skills/ directory
Use agents from .agents/agents/ directory
```

### Claude Web Example

```
User uploads .agents/api-testing.skill.md + .agents/api-test-automation.agent.md
System includes both in context for API testing tasks
```

### CLI / MCP Server Example

```
mcp_load_agents(".agents/agents/");
mcp_load_skills(".agents/skills/");
match_skill_to_task("write_api_test");
```

## Metadata Format

All `.agent.md` and `.skill.md` files use YAML frontmatter:

```yaml
---
name: "Agent/Skill Name"
type: "agent" | "skill"
domain: "testing" | "planning" | "code"
applies_to: ["claude", "copilot", "codex", "custom"]
version: "1.0"
task_types: ["tag1", "tag2"]
---
```

## File Naming Conventions

- **Agents**: `<domain>-<name>.agent.md` (e.g., `api-test-automation.agent.md`)
- **Skills**: `<domain>.skill.md` (e.g., `api-testing.skill.md`)
- **Utilities**: `<topic>.util.md` (e.g., `environment-setup.util.md`)

## See Also

- [Universal Agent-Skills Specification](./AGENT-SKILLS-SPEC.md)
- [API Testing Skill](./skills/api-testing.skill.md)
- [Coding Standards Skill](./skills/coding-standards.skill.md)
