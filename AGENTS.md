# AI Agent Guidelines

This repository utilizes AI assistants and automated scripts to maintain code quality, security, and repository health. All automated and human contributors, including AI agents, must adhere to the following guidelines.

## Core Principle

Every repetitive task that can be automated must be automated. The repository continuously attempts remediation before requesting human intervention.

## Self-Healing and Automation

- **Self-Healing:** Before committing changes, or if you encounter formatting/linting issues, run the self-healing command:
  ```bash
  npm run fix
  ```
  This will automatically resolve linting and formatting issues (`eslint --fix` and `prettier --write`).
- **Pre-commit Validation:** Ensure that your changes do not break existing functionality. You must run the following checks before committing:
  1.  `npm test` (Runs Vitest test suite)
  2.  `npm run format` (Ensures code formatting complies with Prettier)
  3.  `npm run lint` (Checks for any remaining ESLint errors)
  4.  `npm run typecheck` (Validates TypeScript typings)

## Code Quality Standards

- **No `console.log`**: Automation scripts and application code must use `console.info`, `console.warn`, or `console.error` instead.
- **Typing**: Avoid using the `any` type in TypeScript. Prefer explicit types or `Record<string, unknown>`. Unawaited Promises must be marked with `void` (e.g., `void myAsyncFunction()`), but do not use `void` on synchronous functions to pass SonarCloud checks.
- **Imports**: In TypeScript, use namespace imports for Node.js built-in modules (e.g., `import * as fs from 'node:fs'`) instead of default imports.

## Automated Intelligence

The repository utilizes autonomous scripts (located in `scripts/automation/`) via GitHub Actions.

- **Issue Triage:** Automated categorization and response (`npm run ai:triage`).
- **PR Review:** Autonomous AI PR review and feedback (`npm run ai:pr-review`).
- **Architecture & Knowledge Graph:** Automatically generates `docs/architecture/knowledge-graph.json` and diagrams (`npm run analyze:repo`, `npm run generate:diagrams`).
- **Continuous Improvement:** Proactive AI improvement loops (`npm run ai:improve`).

Ensure that the AI processes always perform actual API calls (e.g. using `@google/genai` and `gemini-2.0-flash`) and output files deterministically to avoid pipeline hangs. Always use `npx --yes` when executing commands in non-interactive CI environments.
