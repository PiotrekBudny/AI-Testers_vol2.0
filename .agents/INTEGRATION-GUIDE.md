# Integration Guide: Agents & Skills in Your AI System

This guide explains how to integrate the universal agent-skills structure from `.agents/` into Claude Codex, GitHub Copilot, and other AI systems.

## Quick Start

### For Claude Users

1. **Visit** [Claude Web](https://claude.ai)
2. **Upload** skill files from `.agents/skills/`:
   - `api-testing.skill.md`
   - `coding-standards.skill.md`
3. **Include** agent definition for your task:
   - `api-test-automation.agent.md`
   - `ui-test-automation.agent.md`
   - `test-planner.agent.md`
4. **Ask** your question

**Example Prompt:**

```
I've uploaded these files:
- .agents/agents/api-test-automation.agent.md
- .agents/skills/api-testing.skill.md
- .agents/skills/coding-standards.skill.md

Now, create API tests for the login endpoint.
```

### For GitHub Copilot Users

1. **Add** to repository `.github/copilot-instructions.md`:

```markdown
# Copilot Instructions

## Agent & Skills Structure

This repository uses a universal agent-skills framework in `.agents/`.

### Available Agents

- `.agents/agents/api-test-automation.agent.md` — For API testing tasks
- `.agents/agents/ui-test-automation.agent.md` — For UI testing tasks
- `.agents/agents/test-planner.agent.md` — For test planning

### Available Skills

- `.agents/skills/api-testing.skill.md` — API testing patterns
- `.agents/skills/coding-standards.skill.md` — Repository conventions

### Usage

**For API testing tasks:**
```

/agents:api-test-automation
Create tests for the products endpoint.

```

**For UI testing tasks:**
```

/agents:ui-test-automation
Create page objects and tests for the login flow.

```

**For test planning:**
```

/agents:test-planner
Design a test plan for the checkout feature.

```

See `.agents/README.md` for details.
```

2. **Reference** agents in `.vscode/extensions.json` or custom Copilot settings

3. **Use** in VS Code:

```
@copilot /agents:api-test-automation
Create tests for the orders endpoint
```

### For Custom AI Integration

1. **Parse** YAML frontmatter from `.agent.md` and `.skill.md` files
2. **Extract** metadata (name, type, depends_on)
3. **Load** dependencies recursively
4. **Inject** full text into system prompt
5. **Route** user task to appropriate agent

**Pseudo-code:**

```typescript
interface AgentMetadata {
  name: string;
  type: "agent" | "skill";
  depends_on?: string[];
  task_types: string[];
}

async function loadAgent(filePath: string): Promise<{
  metadata: AgentMetadata;
  content: string;
}> {
  const content = readFile(filePath);
  const { frontmatter, body } = parseFrontmatter(content);
  return {
    metadata: YAML.parse(frontmatter),
    content: body,
  };
}

async function buildContext(agent: string, userTask: string): Promise<string> {
  const agentDef = await loadAgent(agent);
  const skills = agentDef.metadata.depends_on || [];

  let context = `# System Context\n\n`;
  context += `## Active Agent\n${agentDef.content}\n\n`;

  for (const skill of skills) {
    const skillDef = await loadAgent(skill);
    context += `## Skill: ${skillDef.metadata.name}\n${skillDef.content}\n\n`;
  }

  context += `## User Task\n${userTask}`;
  return context;
}
```

## System-Specific Instructions

### GitHub Copilot (VS Code)

**File**: `.github/copilot-instructions.md`

```markdown
# AI-Testers Copilot Configuration

When writing tests for this repository, use the following agents:

## API Testing
```

/agents:api-test-automation

```
Loads:
- Agent: `.agents/agents/api-test-automation.agent.md`
- Skills: `.agents/skills/api-testing.skill.md`, `.agents/skills/coding-standards.skill.md`

## UI Testing
```

/agents:ui-test-automation

```
Loads:
- Agent: `.agents/agents/ui-test-automation.agent.md`
- Skill: `.agents/skills/coding-standards.skill.md`

## Test Planning
```

/agents:test-planner

```
Loads:
- Agent: `.agents/agents/test-planner.agent.md`
- Skill: `.agents/skills/coding-standards.skill.md`

See `.agents/` for full definitions.
```

**References**:

- [GitHub Copilot Enterprise Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-your-organization)
- [VS Code Copilot Extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)

### Claude Web / Claude Codex

**Upload Method:**

1. Click "+" in chat
2. Select files to upload:
   - Choose agent file (e.g., `api-test-automation.agent.md`)
   - Choose dependent skill files (e.g., `api-testing.skill.md`)
3. Add context in message

**Example Message:**

```
I've uploaded:
- API Test Automation Agent
- API Testing Skill
- Coding Standards Skill

Create comprehensive tests for the GET /api/products endpoint.
```

**References**:

- [Claude File Upload](https://support.anthropic.com/en/articles/8487941-custom-instructions)
- [Claude Codex Integration](https://platform.openai.com/docs/guides/code-execution)

### VS Code Native (No Copilot)

**Create** `.vscode/instructions.md`:

```markdown
# Development Guidelines

See `.agents/` for test automation guidelines:

- `.agents/skills/coding-standards.skill.md` — Code conventions
- `.agents/skills/api-testing.skill.md` — API test patterns
- `.agents/agents/api-test-automation.agent.md` — API test guidelines
```

**Use** Ctrl+Shift+I to access VS Code's built-in suggestions.

### MCP Servers / Custom Integrations

Implement auto-discovery:

```typescript
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

class AgentManager {
  private agentsDir: string;
  private skillsDir: string;

  constructor(repoPath: string) {
    this.agentsDir = path.join(repoPath, ".agents", "agents");
    this.skillsDir = path.join(repoPath, ".agents", "skills");
  }

  async discoverAgents(): Promise<Agent[]> {
    return this.discoverFiles(this.agentsDir, "agent.md");
  }

  async discoverSkills(): Promise<Skill[]> {
    return this.discoverFiles(this.skillsDir, "skill.md");
  }

  private async discoverFiles(
    dir: string,
    pattern: string,
  ): Promise<Array<{ metadata: any; content: string }>> {
    const files = fs.readdirSync(dir).filter((f) => f.includes(pattern));

    return files.map((file) => {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const [frontmatter, body] = content.split("---").slice(1, 3);

      return {
        metadata: yaml.load(frontmatter) as Record<string, any>,
        content: body?.trim() || "",
      };
    });
  }

  async loadAgentWithSkills(agentName: string): Promise<{
    agent: string;
    skills: string[];
  }> {
    const agents = await this.discoverAgents();
    const agent = agents.find(
      (a) => a.metadata.name.toLowerCase() === agentName.toLowerCase(),
    );

    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    const skillFiles = agent.metadata.depends_on || [];
    const skills = await this.discoverSkills();

    const loadedSkills = skillFiles
      .map((skillFile) => {
        const skill = skills.find((s) => s.metadata.name === skillFile);
        return skill?.content || "";
      })
      .filter(Boolean);

    return {
      agent: agent.content,
      skills: loadedSkills,
    };
  }
}
```

## File Reference

### Directory Structure

```
.agents/                              # Agent & skills root
├── README.md                         # Overview & getting started
├── AGENT-SKILLS-SPEC.md             # Universal format specification
├── INTEGRATION-GUIDE.md             # This file
├── agents/
│   ├── api-test-automation.agent.md
│   ├── ui-test-automation.agent.md
│   └── test-planner.agent.md
└── skills/
    ├── api-testing.skill.md
    └── coding-standards.skill.md
```

### File Purposes

| File                           | Purpose                       | When to Use               |
| ------------------------------ | ----------------------------- | ------------------------- |
| `api-test-automation.agent.md` | API testing persona           | Writing REST API tests    |
| `ui-test-automation.agent.md`  | UI testing persona            | Writing Playwright tests  |
| `test-planner.agent.md`        | Test planning persona         | Designing test strategies |
| `api-testing.skill.md`         | API patterns & best practices | Reference for API tests   |
| `coding-standards.skill.md`    | Repository conventions        | Reference for all code    |

## Usage Examples

### Example 1: Claude Web - API Testing

**Setup:**

1. Open https://claude.ai
2. Start new conversation
3. Click "+" and upload:
   - `.agents/agents/api-test-automation.agent.md`
   - `.agents/skills/api-testing.skill.md`
   - `.agents/skills/coding-standards.skill.md`

**Prompt:**

```
I've uploaded the API Test Automation Agent and supporting skills.

Create comprehensive tests for this endpoint:
- Endpoint: POST /api/products
- Required fields: name, price, category
- Optional fields: description, tags
- Returns: 201 with created product

Include happy path, validation errors, and edge cases.
```

**Expected Output:**

- Test spec file structure
- Sample tests with Arrange/Act/Assert
- API client class example
- Helper functions
- Suggested tags and organization

### Example 2: Copilot - UI Testing

**Setup:**

1. Create `.github/copilot-instructions.md` with agent references
2. Open VS Code
3. Activate Copilot

**Chat:**

```
@copilot /agents:ui-test-automation
Create page objects and tests for the registration flow.
The flow includes:
1. Email input
2. Password input
3. Password confirmation
4. Display name input
5. Terms checkbox
6. Submit button
```

**Expected Output:**

- RegisterPage class with locators
- Action methods (register)
- Test spec with multiple scenarios
- Proper Arrange/Act/Assert structure

### Example 3: Test Planning

**Setup:**

1. Upload test-planner.agent.md + coding-standards.skill.md
2. Provide feature requirements

**Prompt:**

```
Design a comprehensive test plan for the new checkout feature:
- Cart review
- Shipping address
- Payment processing
- Order confirmation

Include happy path, error cases, edge cases, and suggested tags.
```

**Expected Output:**

- Test scenarios breakdown
- Test case matrix
- Coverage analysis
- Risk assessment
- Tagging strategy
- Estimated test count

## Troubleshooting

### Agent/Skill Not Recognized

**Problem**: "Agent file not found" or similar error

**Solution**:

1. Verify file path: `.agents/agents/` or `.agents/skills/`
2. Check filename matches: `*.agent.md` or `*.skill.md`
3. Verify YAML frontmatter is valid
4. Ensure no typos in file references

### Skills Not Loaded

**Problem**: Skills aren't injected into context

**Solution**:

1. Check `depends_on` field in agent file
2. Verify skill files exist in `.agents/skills/`
3. Ensure skill names match exactly
4. Check for circular dependencies

### File Too Large

**Problem**: Claude/Copilot truncates files

**Solution**:

1. Split large skills into multiple files
2. Use summaries instead of full examples
3. Reference external documentation
4. Consider breaking into sub-skills

## Version Management

### Updating Agents/Skills

1. **Edit** the `.md` file in `.agents/`
2. **Increment** version in frontmatter
3. **Document** changes (major.minor.patch)
4. **Commit** to git

Example version update:

```yaml
---
version: "1.0" # → "1.1"
---
```

### Changelog

Keep `.agents/CHANGELOG.md`:

```markdown
# Changelog

## [1.1] - 2026-10-20

### Added

- API testing skill: pagination pattern examples

### Changed

- Updated coding standards for new file structure

## [1.0] - 2026-10-19

### Initial Release

- 3 agents (API, UI, planning)
- 2 core skills
- Universal specification
```

## Best Practices

1. **Keep agents focused** — One persona per agent
2. **Make skills modular** — Reusable across agents
3. **Document thoroughly** — Include examples for each pattern
4. **Version consistently** — Use semantic versioning
5. **Update regularly** — Keep in sync with repository standards
6. **Test integration** — Verify agent/skill work together
7. **Gather feedback** — Improve based on usage

## Performance Tips

### For Claude Web

- Upload skills with agent (keeps in same context)
- Use shorter agent definitions for faster processing
- Reference external docs instead of embedding full code

### For Copilot

- Pre-load popular agents in `.github/copilot-instructions.md`
- Keep skill files under 15KB each
- Use concise examples

### For Custom Systems

- Cache parsed agents/skills
- Load only required dependencies
- Index by task type for fast routing

## References

- [AGENT-SKILLS-SPEC.md](./AGENT-SKILLS-SPEC.md) — Format specification
- [README.md](./README.md) — Quick overview
- [API Testing Skill](./skills/api-testing.skill.md)
- [Coding Standards Skill](./skills/coding-standards.skill.md)
- [API Test Automation Agent](./agents/api-test-automation.agent.md)
- [UI Test Automation Agent](./agents/ui-test-automation.agent.md)
- [Test Planner Agent](./agents/test-planner.agent.md)

## Support

For issues or questions:

1. Check this integration guide
2. Review [AGENT-SKILLS-SPEC.md](./AGENT-SKILLS-SPEC.md)
3. Examine agent/skill metadata
4. Open an issue with:
   - Agent/skill name
   - AI system used
   - Expected vs. actual behavior
   - Relevant prompt and response
