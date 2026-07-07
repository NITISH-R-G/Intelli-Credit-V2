# AI Assistant Guidelines for Intelli-Credit Terminal

This repository is designed to be highly automated, self-healing, and self-improving. As an AI assistant, you must adhere to the following guidelines:

## 1. Automation and Self-Healing

- **Automate Repetitive Tasks**: Always prioritize automating repetitive maintenance, reporting, or code-fixing tasks.
- **Use Auto-Fixing Tools**: Leverage the `npm run fix` command for self-healing the codebase (e.g., automatically resolving linting/formatting errors).

## 2. Pre-Commit Verification

Before completing your tasks and proposing changes, ensure that all necessary validation checks pass. You MUST run:

- `npm test` to ensure all tests pass.
- `npm run format` (or `npm run format:check`) to ensure code formatting complies with Prettier.
- `npm run lint` to enforce ESLint rules.

## 3. Security and Automation Scripts

- **Command Injection Prevention**: Never use `execSync` with concatenated command strings. Use `execFileSync` with separated executable and argument arrays. Ensure that pipeline commands are rewritten using native Node.js logic as `execFileSync` does not invoke a shell.
- **No Console Logs**: The ESLint configuration prohibits `console.log`. Automation scripts and application code must use `console.info`, `console.warn`, or `console.error` instead.
- **GitHub Actions Security**: In CI workflows, variables like `github.base_ref` and `github.head_ref` must be assigned to environment variables and referenced (e.g., `$BASE_REF`) in run scripts, rather than directly injected using `${{ }}`.

## 4. Documentation and Knowledge Maintenance

- **Docs Generation**: The repository autonomously maintains its documentation in the `docs/` folder via `npm run analyze:repo`, `npm run generate:diagrams`, and `npm run generate:knowledge-graph`. Always ensure your changes do not break these scripts.
- **Continuous Operations**: The project utilizes various AI-powered scripts in `scripts/automation/` (e.g., `ai:triage`, `ai:improve`, `ai:pr-review`) via `tsx`. Maintain and enhance these scripts according to the repository's needs.

Always focus on maximizing the use of automated capabilities and available GitHub features while maintaining strict security checks.
