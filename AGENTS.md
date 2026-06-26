# Guidelines for AI Assistants

Welcome, AI Contributor. When working on this repository, please adhere to the following rules to ensure automation, self-healing, and high code quality.

## Core Directives

1. **Automation First**: Automate every repetitive task. If a new capability is introduced, try to add it to our automated scripts in `scripts/automation/`.
2. **Self-Healing**: Always attempt to run `npm run fix` before committing or requesting a human. This script automatically formats code and fixes linting errors.
3. **No Console Logs**: Use `console.info`, `console.warn`, or `console.error` instead of `console.log` in both automation scripts and application code.
4. **Secure Execution**: When running child processes in Node.js, use `execFileSync` (or `spawnSync`) instead of `execSync` to prevent command injection vulnerabilities. Pass arguments as an array rather than concatenating them into a string.
5. **Kebab-case in Workflows**: When using the `thollander/actions-comment-pull-request@v3` action, ensure you use kebab-case for its inputs (e.g., `file-path`, `comment-tag`).

## Pre-commit Requirements

Before finalizing any code change or submitting a pull request, you **MUST** run the following validations:

- `npm test` - Ensure all tests pass.
- `npm run format` - Ensure Prettier formatting is applied.
- `npm run lint` - Ensure ESLint checks pass without errors.

If any of these fail, use `npm run fix` and manually repair any remaining issues before proceeding.
