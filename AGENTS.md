# AI Assistant Guidelines for Intelli-Credit-V2

Welcome, AI Agent/Assistant! This repository is designed to be highly automated, self-healing, and maintainable. You are expected to adhere to the following rules when working on this codebase:

## 1. Automation First
- **Self-Healing**: Leverage `npm run fix` before asking for human intervention to fix linting and formatting issues.
- **Pre-commit Validation**: You must always run `npm test`, `npm run format`, and `npm run lint` before committing any changes. Ensure all checks pass.

## 2. Secure Script Execution
- **Command Injection Prevention**: Never use `execSync` with concatenated strings, especially when dealing with user inputs or environment variables (e.g., in GitHub Actions contexts).
- **Use `execFileSync`**: When running automated scripts, use `execFileSync` with separated executable and argument arrays. Note that `execFileSync` does not invoke a shell and does not support pipes (`|`). You must rewrite piped commands using native Node.js logic.

## 3. GitHub Actions Security
- When writing or modifying GitHub Actions workflows, event variables like `github.base_ref`, `github.head_ref`, and `github.event.issue.body` **must** be assigned to environment variables directly in the step's `env` block and referenced in run scripts.
- **Do not** directly inject them inline using `${{ }}` (e.g., `export VAR="${{ }}"`) to prevent command injection vulnerabilities.

## 4. Console Logging Policy
- **Prohibition on `console.log`**: The project's ESLint configuration prohibits the use of `console.log`.
- **Alternatives**: In both automation scripts and application code, you must strictly use `console.info`, `console.warn`, or `console.error`.

## 5. Automation Scripts
- Automation scripts are placed in `scripts/automation/` and run via `tsx`. Ensure any new script follows the security guidelines mentioned in step 2.

## 6. PR Review Automation
- When generating git diffs in GitHub Actions triggered by `pull_request` events, use `git diff origin/$BASE_REF...HEAD` instead of referencing `$HEAD_REF`.

Failure to follow these instructions may cause CI failures (e.g., Sourcery CI security checks or ESLint errors). Operate autonomously but securely.
