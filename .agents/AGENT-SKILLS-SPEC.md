# Universal Agent-Skills Specification v1.0

A standardized format for defining AI agents and skills that works across Claude Codex, GitHub Copilot, and other AI systems.

## Overview

This specification enables:

- **Portability**: Same agent/skill definitions work across multiple AI systems
- **Discoverability**: Tools can auto-detect and load agents/skills from repositories
- **Reusability**: Community can share agents and skills
- **Clarity**: Standardized format makes intent and usage clear

## Document Metadata

All agent and skill documents start with YAML frontmatter:

```yaml
---
name: "Display Name"
type: "agent" | "skill"
domain: "testing" | "planning" | "code" | "review" | "other"
applies_to: ["claude", "copilot", "codex", "custom"]
version: "1.0"
task_types: ["api_testing", "test_planning", "code_review"]
status: "stable" | "beta" | "experimental"
depends_on: ["other.skill.md"]
---
```

### Metadata Fields

| Field        | Type               | Required | Description                                             |
| ------------ | ------------------ | -------- | ------------------------------------------------------- |
| `name`       | string             | ✓        | Human-readable name (30 chars max)                      |
| `type`       | "agent" \| "skill" | ✓        | Document type                                           |
| `domain`     | string             | ✓        | Primary domain: testing, planning, code, review, other  |
| `applies_to` | string[]           | ✓        | Target systems: claude, copilot, codex, custom          |
| `version`    | semver             | ✓        | Document version (e.g., "1.0", "2.1.3")                 |
| `task_types` | string[]           | ✓        | Task categories this agent/skill handles                |
| `status`     | string             | ✗        | Document maturity: stable (default), beta, experimental |
| `depends_on` | string[]           | ✗        | Required skill files this depends on                    |

## Agent Definition

Agents are specialized AI personas optimized for specific task categories.

### Structure

```markdown
---
name: "API Test Automation Agent"
type: "agent"
domain: "testing"
applies_to: ["claude", "copilot", "codex"]
version: "1.0"
task_types: ["api_testing", "api_automation", "test_implementation"]
depends_on: ["api-testing.skill.md", "coding-standards.skill.md"]
status: "stable"
---

# API Test Automation Agent

## Overview

[Brief description of what this agent does]

## Responsibilities

- Task 1
- Task 2
- Task 3

## Capabilities

- Capability 1
- Capability 2

## Skills Required

- [Link to skill files this agent uses]

## Usage Instructions

### When to Use This Agent

- Scenario 1
- Scenario 2

### How to Invoke

For Claude/Claude Codex:
```

Load .agents/agents/api-test-automation.agent.md
Load .agents/skills/api-testing.skill.md
Load .agents/skills/coding-standards.skill.md
Then ask: "Create API tests for the login endpoint"

```

For Copilot:
```

Use command: /agents:api-test-automation
Then: "Create API tests for the login endpoint"

```

## Decision Points
[When to choose this agent vs. another]

## Example Workflows
[Example interaction flows]
```

### Agent Best Practices

1. **Clear Persona**: Define who the agent is and what they specialize in
2. **Bounded Responsibility**: Agent should handle a specific category of tasks
3. **Explicit Skills**: Always list dependent skills in `depends_on`
4. **Usage Instructions**: Provide clear invocation examples for each system
5. **Workflow Examples**: Show real-world usage patterns

## Skill Definition

Skills document domain knowledge, patterns, and best practices without being task-specific.

### Structure

````markdown
---
name: "API Testing Skill"
type: "skill"
domain: "testing"
applies_to: ["claude", "copilot", "codex"]
version: "1.0"
task_types: ["api_testing", "api_debugging"]
status: "stable"
---

# API Testing Skill

## Overview

[What this skill covers and why it matters]

## When to Use

- Scenario 1
- Scenario 2

## Core Concepts

### Concept 1: [Title]

[Explanation with examples]

### Concept 2: [Title]

[Explanation with examples]

## Patterns & Best Practices

### Pattern 1: [Name]

```typescript
// Example code
```
````

### Pattern 2: [Name]

```typescript
// Example code
```

## Common Pitfalls

❌ **Don't:**

- Anti-pattern 1
- Anti-pattern 2

## References

- [Link 1](url)
- [Link 2](url)

```

### Skill Best Practices

1. **Self-Contained**: Skill should be understandable without prior context
2. **Example-Rich**: Include concrete, runnable examples
3. **Pattern-Focused**: Document recurring patterns and solutions
4. **Anti-Patterns**: Highlight common mistakes to avoid
5. **Modular**: Skills should be composable and referenceable

## Directory Organization

```

.agents/
├── README.md
├── AGENT-SKILLS-SPEC.md # This file
├── agents/
│ ├── test-planner.agent.md
│ ├── api-test-automation.agent.md
│ └── ui-test-automation.agent.md
└── skills/
├── api-testing.skill.md
├── ui-testing.skill.md
├── test-planning.skill.md
├── coding-standards.skill.md
└── environment-setup.util.md

````

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Agent | `<domain>-<name>.agent.md` | `api-test-automation.agent.md` |
| Skill | `<domain>.skill.md` | `api-testing.skill.md` |
| Utility | `<topic>.util.md` | `environment-setup.util.md` |

## Integration Points

### For AI Systems

1. **Parse frontmatter**: Extract metadata using YAML parser
2. **Check applies_to**: Filter agents/skills by target system
3. **Load dependencies**: Recursively load files in `depends_on`
4. **Inject context**: Include full text of skills in system prompt
5. **Match task**: Route tasks to agents by `task_types`

### For Developers

1. **Create**: Write `.agent.md` or `.skill.md` with valid frontmatter
2. **Test**: Verify agent/skill works in intended systems
3. **Document**: Include clear examples and usage instructions
4. **Version**: Update version field when making changes
5. **Publish**: Add to repository `.agents/` directory

### For Repositories

1. **Place agents/skills in `.agents/`**: Standard location for discovery
2. **Link from README**: Reference `.agents/README.md` in main docs
3. **Keep in sync**: Update when coding standards or patterns change
4. **Version tracking**: Keep agents/skills in git history

## Examples

### Example Agent: API Test Automation

**File**: `.agents/agents/api-test-automation.agent.md`

```yaml
---
name: "API Test Automation Agent"
type: "agent"
domain: "testing"
applies_to: ["claude", "copilot", "codex"]
version: "1.0"
task_types: ["api_testing", "test_implementation"]
depends_on: ["api-testing.skill.md", "coding-standards.skill.md"]
status: "stable"
---
````

### Example Skill: API Testing

**File**: `.agents/skills/api-testing.skill.md`

```yaml
---
name: "API Testing Skill"
type: "skill"
domain: "testing"
applies_to: ["claude", "copilot", "codex"]
version: "1.0"
task_types: ["api_testing"]
status: "stable"
---
```

## Tooling Support

### Auto-Discovery

Tools should implement agent/skill discovery:

```typescript
// Pseudo-code
function discoverAgents(repoPath: string): Agent[] {
  const agents = glob(`${repoPath}/.agents/agents/*.agent.md`);
  return agents.map((file) => parseAgentMetadata(file));
}

function discoverSkills(repoPath: string): Skill[] {
  const skills = glob(`${repoPath}/.agents/skills/*.skill.md`);
  return skills.map((file) => parseSkillMetadata(file));
}
```

### Context Injection

```typescript
// Load skill for Claude/Copilot
async function loadSkillContext(skillPath: string): Promise<string> {
  const metadata = parseYAML(skillPath);
  if (!metadata.applies_to.includes(targetSystem)) {
    throw new Error(`Skill not applicable to ${targetSystem}`);
  }
  return readFile(skillPath);
}
```

## FAQ

**Q: Can an agent depend on multiple skills?**  
A: Yes. List all required skills in the `depends_on` array.

**Q: Can a skill depend on another skill?**  
A: Yes. Use `depends_on` to chain skills. Keep the dependency graph shallow (2-3 levels max).

**Q: How do I update an existing agent/skill?**  
A: Edit the file and increment the `version` field. Commit changes to git.

**Q: Can different systems have different agent definitions?**  
A: Use the `applies_to` array to target specific systems. Create separate files if needed.

**Q: How long should a skill document be?**  
A: Aim for 2,000-5,000 words. If longer, consider splitting into multiple skills.

## Migration Guide

### From Copilot-Only Format

```yaml
# Old: .github/copilot-instructions.md
# New: .agents/agents/xxx.agent.md + .agents/skills/yyy.skill.md
```

### From Claude System Prompt

```
# Old: Long system prompt in chat context
# New: Separate skills in .agents/skills/ with clear dependencies
```

## Version History

| Version | Date       | Changes               |
| ------- | ---------- | --------------------- |
| 1.0     | 2026-10-19 | Initial specification |

## See Also

- [Copilot Customization Docs](https://docs.github.com/en/copilot/customizing-copilot)
- [Claude Custom Instructions](https://support.anthropic.com/en/articles/8487941-custom-instructions)
- [YAML Specification](https://yaml.org/)
