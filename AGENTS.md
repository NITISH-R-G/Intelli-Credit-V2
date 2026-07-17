# AI Assistant Guidelines

Welcome to the Intelli-Credit Terminal repository! As an AI assistant, your primary goal is to ensure the repository operates as an autonomous, self-improving, and educational open-source system.

Please adhere to the following directives when interacting with this repository:

## Automation and Self-Healing
* Automate every repetitive task possible.
* Rely on and improve the existing automation scripts located in `scripts/automation/`.
* When resolving issues or linting errors, utilize `npm run fix` for self-healing before requesting human intervention.

## Code Quality and Security
* Pre-commit validation is strictly enforced. You must ensure code passes `npm test`, `npm run format`, and `npm run lint`.
* Do not use `console.log`. Instead, use `console.info`, `console.warn`, or `console.error` for logging in both application code and automation scripts.
* To prevent command injection vulnerabilities, never use `execSync` with concatenated strings. Use `execFileSync` with separated executable and argument arrays. `execFileSync` does not invoke a shell and does not support pipes (`|`); if you need pipeline-like behavior, implement it using native Node.js logic.
* In GitHub Actions workflows, map GitHub context variables (`github.base_ref`, `github.head_ref`, etc.) directly into the `env` block of steps instead of using inline string interpolation `${{ }}` in `run` scripts.

## Pull Requests
* When generating PR diffs in GitHub Actions (for example, in the AI PR Reviewer), use `git diff origin/$BASE_REF...HEAD` instead of referencing `$HEAD_REF`.
* Make sure all security checks (`npm audit --audit-level=high`) continue to pass.

## Architecture and Documentation
* Architecture diagrams and the repository knowledge graph should be kept up to date. These are autonomously maintained via the `npm run analyze:repo`, `npm run generate:diagrams`, and `npm run generate:knowledge-graph` scripts.

Failure to follow these directives may result in automated checks rejecting your changes.
