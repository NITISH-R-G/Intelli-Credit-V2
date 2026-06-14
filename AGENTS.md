# Autonomous Repository Guidelines

Welcome to the autonomous repository! This document serves as the core rulebook for both human contributors and AI assistants (maintainers, reviewers, documentation agents, and code-fixing bots).

## Core Directives

1. **Automation First**: Every repetitive task MUST be automated. Do not perform manual chores that a script can do.
2. **Self-Healing**: The repository continuously attempts remediation before requesting human intervention.
3. **Continuous Updates**: Documentation, architecture diagrams, and health dashboards must stay in sync with the codebase via automated hooks.

## Guidelines for AI Assistants

AI assistants interacting with this codebase MUST adhere to the following rules:

- **Automate Everything**: Identify any opportunities for automation and implement them.
- **Self-Healing Execution**: Before concluding a fix, AI assistants should always utilize self-healing commands.
  - Execute `npm run fix` to automatically resolve formatting, linting, and basic code issues.
- **Validation & Pre-commit**: Never suggest or commit changes without rigorous validation. You MUST run the following before finalizing changes:
  - `npm test` - to ensure tests pass and coverage is maintained.
  - `npm run format` - to ensure Prettier compliance.
  - `npm run lint` - to ensure type-safety and ESLint compliance.
- **Documentation**: AI reviewers must automatically generate summaries for PRs and flag missing or outdated documentation.
- **Architecture Intelligence**: AI bots should continuously monitor for architectural drift and trigger `npm run analyze:repo` or `npm run generate:diagrams` when structural changes occur.
- **Maintainability**: AI systems must detect complex/duplicate code and either log a technical debt issue or automatically submit a refactor PR if confidence is high.

## Human Contributors

If you are contributing code:

1. Familiarize yourself with the automated PR checklists.
2. Rely on the CI/CD pipelines to catch formatting and linting bugs.
3. Be aware that your PR will be automatically reviewed by our AI maintainer system.
