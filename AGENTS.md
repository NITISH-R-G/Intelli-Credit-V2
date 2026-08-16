# Guidelines for AI Assistants

This repository is designed to be an advanced, autonomous, self-improving open-source system.
As an AI assistant working on this repository, you must adhere to the following guidelines:

## Core Principle
Every repetitive task that can be automated must be automated.

## Automation and Self-Healing
- **Self-Healing Script:** Use `npm run fix` to attempt to automatically fix linting, formatting, and other issues before requiring manual intervention.
- **Automation:** Ensure that automation scripts inside `scripts/automation/` handle failures gracefully, such as exiting with code 0 when `GEMINI_API_KEY` is missing to support open-source contributions.

## Code Quality & Pre-commit Validation
- **Validation:** Always validate your changes before finalizing.
- Run `npm test` to run all unit tests.
- Run `npm run format` (or `npm run format:check`) to ensure code matches formatting standards.
- Run `npm run lint` to ensure code meets ESLint rules.

## Architectural Integrity
- Follow the repository's modular architecture.
- Maintain and update documentation autonomously when making substantive architectural changes.
- Ensure that you use strict typing and mark unawaited promises with `void` to pass SonarCloud quality gates. Do not use `void` on synchronous functions.

## Scripting Rules
- In GitHub Actions workflows, use `process.env.GITHUB_EVENT_PATH` and read it directly via `fs.readFileSync` and `JSON.parse` rather than relying on injected `github.event.*` variables for safety against command injection.
- Do not use `execSync` with concatenated command strings. Use `execFileSync` with arrays to prevent command injection.
- When generating files, create parent directories using `fs.mkdirSync(dir, { recursive: true })`.
- Explicitly set Node versions to `20` in GitHub Actions.
- Pin GitHub Actions to exact commit SHAs.
