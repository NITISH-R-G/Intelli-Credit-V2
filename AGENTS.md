# AI Assistant Guidelines (AGENTS.md)

Welcome to the Intelli-Credit Terminal repository! As an AI assistant or human contributor, you must adhere to the following core principles to maintain the health, automation, and intelligence of this repository.

## Core Directives

1. **Automation First:** Every repetitive task that can be automated MUST be automated. Leverage the `scripts/automation/` directory and GitHub Actions workflows.
2. **Self-Healing:** Continuously attempt remediation before requesting human intervention. Use `npm run fix` to attempt automatic linting, formatting, and security fixes.
3. **Repository Intelligence:** Ensure documentation, architecture diagrams, and repository health metrics are always up-to-date. Refer to `docs/` for auto-generated insights.
4. **Pre-commit Validation:** Before committing any changes, you MUST ensure tests pass (`npm test`) and code quality is maintained (`npm run lint`, `npm run format`). Always run the `pre_commit_instructions` tool and follow its guidelines before final submission.
5. **Knowledge Discovery:** Keep the `README.md` and architecture documentation synchronized with reality. The `metadata.json` acts as the source of truth for the automated repo mapping.
6. **AI Maintainer Collaboration:** Expect the AI reviewer (`ai-reviewer.ts`) to analyze pull requests. Address its findings constructively.

## Development Workflow

1.  Make your code changes.
2.  Run `npm test` to verify functionality.
3.  Run `npm run fix` to auto-heal formatting and linting.
4.  Run `npm run analyze:repo` and `npm run generate:diagrams` to update the repository knowledge graph if structural changes were made.
5.  Follow pre-commit instructions.
6.  Submit a Pull Request.

By adhering to these guidelines, you help ensure this repository operates like a world-class engineering organization that never sleeps.
