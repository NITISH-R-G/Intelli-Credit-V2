# AI Agent Guidelines

This file provides guidelines and constraints for AI assistants (like Copilot, Cursor, Gemini, Claude, or other autonomous agents) operating within this repository.

By default, any autonomous AI script or manual AI usage must adhere to these rules.

## Core Directives

1. **Automation First**: Every repetitive task that can be automated must be automated.
2. **Self-Healing**: Always prioritize resolving code quality issues automatically.
3. **No Direct Pushes to Main**: Automated systems must open Pull Requests for changes (e.g. documentation, architecture diagrams, fixes).

## Workflows and Self-Healing

When asked to fix code or clean up the repository, the AI MUST use the self-healing tools provided:

- **Self-Healing Automation**: Run `npm run fix` to automatically format the codebase and fix linting errors.

## Pre-Commit Validation

Before suggesting a fix, submitting a PR, or finalizing code changes, the AI must ensure the repository is in a valid state by running the following checks:

1. **Tests**: `npm test`
2. **Formatting**: `npm run format` (or `npm run format:check`)
3. **Linting**: `npm run lint`
4. **Type Checking**: `npm run typecheck`

## Code Guidelines

- React `<button>` elements must possess an explicit `type` attribute (e.g., `type="button"`) to satisfy SonarCloud and linting rules.
- The project's ESLint configuration prohibits `console.log`. Automation scripts and application code must use `console.info`, `console.warn`, or `console.error` instead.
- In TypeScript code, explicitly mark unawaited Promises with `void` (e.g., `void myAsyncFunction();`) to pass SonarCloud quality gates and strict ESLint checks. However, do NOT use `void` on synchronous functions, as SonarCloud flags this as a vulnerability.

## Automation Script Constraints

- For file discovery in Node.js automation scripts, use cross-platform native Node.js methods like recursive `fs.readdirSync` rather than relying on Unix-specific shell commands (e.g., `find`) to ensure compatibility across environments like Windows.
- AI automation scripts utilizing the Google GenAI SDK are configured to use the `gemini-2.0-flash` model for repository tasks (triage, PR review, improvement loops).
- AI scripts must exit gracefully with code `0` when `GEMINI_API_KEY` is missing, ensuring GitHub Action workflows do not fail for open-source contributors opening PRs from external forks.
- AI automation scripts (e.g., in `scripts/automation/`) must ensure parent directories like `docs/history/` and `docs/architecture/` exist using `fs.mkdirSync(dir, { recursive: true })` before attempting to write outputs.
