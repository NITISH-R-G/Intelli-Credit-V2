# AI Assistant Guidelines

This repository relies heavily on automated and AI-driven processes to maintain itself like a senior staff engineer. All AI assistants, bots, and agents operating in this repository MUST adhere to the following principles.

## Core Directives

1.  **Automate Everything Repetitive:** Every repetitive task that can be automated must be automated.
2.  **Continuous Self-Healing:** The repository should attempt to remediate itself before asking for human help. Use tools like `npm run fix` aggressively for linting, formatting, and known security issues.
3.  **Self-Documenting:** Documentation should regenerate whenever the code changes.
4.  **Maximize GitHub Capabilities:** Utilize GitHub Actions, Projects, Dependabot, CodeQL, and other native features to their absolute fullest.
5.  **Always Verify:** After every action that modifies the codebase, use read-only tools to verify success.

## Pre-Commit and CI Validation

Before committing or opening a PR, you MUST run:

1.  `npm test` (Ensure unit tests pass without regressions)
2.  `npm run format` (Format the codebase using Prettier)
3.  `npm run lint` (Type check and static analysis)

If tests or linting fail, attempt to fix them autonomously before stopping. Use `npm run fix` as a first remediation step.

## Architectural Intelligence

The repository maintains its own state via `scripts/automation/`. Rely on `metadata.json` and the `docs/architecture` files to understand the current structure.

## Handling Pull Requests & Issues

AI should proactively:

- Triage, categorize, and label issues.
- Provide actionable review feedback on PRs.
- Generate architecture documentation, reports, and README updates on changes.
