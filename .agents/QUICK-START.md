# Quick Start

## Choose a Guide

| Task                              | Start with                                                         | Add as needed                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Explore an application or feature | [Explorer](./agents/explorer.agent.md)                             | [Test Planner](./agents/test-planner.agent.md)                                                                            |
| Plan test coverage                | [Test Planner](./agents/test-planner.agent.md)                     | [Coding Standards](./skills/coding-standards/SKILL.md)                                                                    |
| Implement API tests               | [API Test Automation](./agents/api-test-automation.agent.md)       | [API Testing](./skills/api-testing-skill/SKILL.md), [Coding Standards](./skills/coding-standards/SKILL.md)                |
| Implement UI tests                | [UI Test Automation](./agents/ui-test-automation.agent.md)         | [Playwright Workflow](./skills/playwright-test-workflow/SKILL.md), [Coding Standards](./skills/coding-standards/SKILL.md) |
| Set up test infrastructure        | [Test Framework Starter](./agents/test-framework-starter.agent.md) | [Static Analysis](./skills/static-code-analysis-typescript/SKILL.md)                                                      |
| Coordinate a broad testing effort | [QA Orchestrator](./agents/qa-orchestrator.agent.md)               | Explorer, Test Planner, Test Framework Starter, Test Coder as applicable                                                  |
| Review a focused change           | [Code Review](./skills/code-review/SKILL.md)                       | [Coding Standards](./skills/coding-standards/SKILL.md)                                                                    |
| Clean up code                     | [Code Cleanup](./skills/code-cleanup/SKILL.md)                     | [Coding Standards](./skills/coding-standards/SKILL.md)                                                                    |

## Using the Files

- Provide root `AGENTS.md` plus the selected task-specific Markdown files as context, or reference them using the AI platform's supported repository instructions.
- Follow each file's `depends_on` list and the repository's own conventions.
- For browser exploration, use [Playwright CLI](./skills/playwright-cli/SKILL.md); for UI test authoring, use [Playwright Test Workflow](./skills/playwright-test-workflow/SKILL.md).
- For an overview of dependencies and files, see [Structure Summary](./STRUCTURE-SUMMARY.md).

## Platform Note

The files are portable instructions, not a plugin. Slash commands, auto-loading, and dependency loading work only when the platform is configured to support them. See [Integration Guide](./INTEGRATION-GUIDE.md).
