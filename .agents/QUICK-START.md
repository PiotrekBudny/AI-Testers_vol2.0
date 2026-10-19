# Universal Agent-Skills Framework — Quick Start

## What Is This?

A complete, cross-platform AI testing framework for Claude, GitHub Copilot, and custom systems. Includes specialized agents for test planning, exploration, implementation, and orchestration, plus reusable skills for API testing, UI testing, code quality, and more.

## For Users

### I want to write API tests

👉 **Use**: `api-test-automation.agent.md` + `api-testing.skill.md`

```
1. Use api-testing.skill for patterns and exploration guidance
2. Use api-test-automation agent to implement tests
3. Follow curl-based exploratory workflow before coding
```

### I want to write UI tests

👉 **Use**: `ui-test-automation.agent.md` + `playwright-test-workflow.skill.md`

```
1. Use playwright-test-workflow for authoring guidance
2. Use ui-test-automation agent to implement Page Objects and tests
3. Use playwright-cli.skill for exploration and debugging
```

### I want to plan a testing initiative

👉 **Use**: `explorer.agent.md` → `test-planner.agent.md`

```
1. Start with Explorer to discover APIs, pages, and risks
2. Pass findings to Test Planner to create prioritized test matrix
3. Use Test Planner output with Test Coder for implementation
```

### I want to set up tests from scratch

👉 **Use**: `qa-orchestrator.agent.md`

```
1. QA Orchestrator coordinates the full workflow:
   - Explorer discovers what to test
   - Test Planner prioritizes tests
   - Test Framework Starter sets up infrastructure
   - Test Coder implements tests
2. Orchestrator synthesizes final summary
```

### I want code review feedback

👉 **Use**: `code-review.skill.md`

```
1. Share code snippet or file
2. Skill provides checklist-based feedback
3. Identifies correctness, readability, tests, risks
```

## For AI Systems

### Claude / Claude Codex

```
1. Upload `.agents/README.md` for context
2. Upload specific skill + agent files
3. Reference in prompt: "Use the [skill-name] skill with [agent-name] agent"
```

### GitHub Copilot

```
1. Reference agents via `/agents:agent-name` command
2. Skills auto-load via `depends_on` metadata
3. Multi-turn workflows coordinate between agents
```

### Custom Systems

```
1. Parse YAML frontmatter from `.agents/AGENT-SKILLS-SPEC.md`
2. Load files recursively via `depends_on` field
3. Use `applies_to` field for availability
4. Route tasks via `task_types` field
```

## File Organization

```
.agents/
├── README.md                              # Start here
├── QUICK-START.md                         # This file
├── AGENT-SKILLS-SPEC.md                   # Format specification
├── INTEGRATION-GUIDE.md                   # System-specific setup
├── MIGRATION-SUMMARY.md                   # History and changes
│
├── agents/                                # 7 specialized agents
│   ├── api-test-automation.agent.md       # REST API testing
│   ├── ui-test-automation.agent.md        # UI testing
│   ├── explorer.agent.md                  # Discovery & exploration
│   ├── test-planner.agent.md              # Test strategy
│   ├── test-coder.agent.md                # Test implementation
│   ├── test-framework-starter.agent.md    # Infrastructure setup
│   └── qa-orchestrator.agent.md           # Workflow coordination
│
└── skills/                                # 7 reusable skills
    ├── api-testing.skill.md               # API test patterns & workflow
    ├── playwright-test-workflow.skill.md  # UI test authoring workflow
    ├── playwright-cli.skill.md            # Browser automation reference
    ├── coding-standards.skill.md          # Project conventions
    ├── code-cleanup.skill.md              # Code formatting & linting
    ├── code-review.skill.md               # Code review process
    └── static-code-analysis-typescript.skill.md  # Type checking setup
```

## Complete Workflow Example

### Scenario: "I need comprehensive tests for the login feature"

```
1. START: Ask QA Orchestrator
   "Create tests for login feature (API + UI)"

2. EXPLORE:
   - Explorer discovers login endpoints, page structure, risks
   - Returns exploration summary

3. PLAN:
   - Test Planner prioritizes (P0: happy path, P1: errors, P2: edge cases)
   - Creates test matrix and file organization

4. SETUP (if needed):
   - Test Framework Starter ensures Playwright is configured

5. IMPLEMENT (parallel):
   - Test Coder (API) implements login endpoint tests
   - Test Coder (UI) implements login page tests

6. DELIVER:
   - QA Orchestrator synthesizes full summary
   - Provides test files, commands to run, metrics
```

## Quick Commands

### View skill/agent documentation

```bash
# In your AI system, reference:
api-testing.skill.md                 # API test patterns
playwright-test-workflow.skill.md    # UI test workflow
explorer.agent.md                    # Discovery process
test-planner.agent.md                # Planning process
```

### Run tests (after implementation)

```bash
npm test                             # All tests
npm run test:api                     # API only
npm run test:ui                      # UI only
npm run test:headed                  # UI in headed mode
npm run test:debug                   # Debug mode
```

## Key Features

✨ **Universal Format**

- Works with Claude, Copilot, Codex, and custom systems
- Consistent YAML frontmatter across all files
- Automatic dependency resolution

🤖 **Specialized Agents**

- Explorer: Discovers application structure and risks
- Test Planner: Creates prioritized test strategies
- Test Coder: Implements production tests
- QA Orchestrator: Coordinates full workflows

🛠️ **Comprehensive Skills**

- API testing with exploratory workflow
- UI testing with Playwright best practices
- Code quality and review processes
- Infrastructure setup and tooling

📊 **Phase-Based Workflows**

- Explore → Plan → Setup → Implement → Deliver
- Clear handoff points between stages
- Well-defined responsibilities

🎯 **Best Practices Built-In**

- Arrange/Act/Assert test structure
- Page Object pattern for UI tests
- Test data factories for API tests
- Proper waits (no sleep calls)

## Troubleshooting

### Agents not loading

- Check that files use universal YAML frontmatter
- Verify `applies_to` includes your system
- Ensure `depends_on` skills exist

### Skills missing references

- Check `AGENT-SKILLS-SPEC.md` for format
- Verify skill names in `depends_on` match filenames
- Ensure all referenced files are in `.agents/` directory

### Workflow coordination issues

- Use QA Orchestrator for multi-phase workflows
- Ensure each agent gets required inputs
- Check agent handoff documentation

## Next Steps

1. **Read** [README.md](./README.md) for full overview
2. **Choose** an agent/skill for your use case
3. **Follow** the documented workflow
4. **Adapt** to your repository structure
5. **Share** feedback and improvements

## Support

- 📖 Full documentation: [README.md](./README.md)
- 📋 Format spec: [AGENT-SKILLS-SPEC.md](./AGENT-SKILLS-SPEC.md)
- 🔧 Integration guide: [INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)
- 📊 Structure details: [STRUCTURE-SUMMARY.md](./STRUCTURE-SUMMARY.md)
- 📝 Migration history: [MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md)

---

**Framework Version**: 1.0.0  
**Status**: ✅ Ready to Use  
**Compatible With**: Claude, Copilot, Codex, Custom Systems
