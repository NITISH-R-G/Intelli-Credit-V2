# AI Agent Guidelines

Welcome to the Intelli-Credit AI automation environment. As an AI assistant or automated agent working on this repository, you must adhere strictly to the following guidelines to maintain a world-class, autonomous, and self-healing ecosystem.

## Core Rules

1. **Automate Repetitive Tasks**: Any task that can be automated must be. If you find yourself performing a repetitive task, create a script in `scripts/automation/` or a GitHub workflow to handle it autonomously.
2. **Self-Healing**: Always use the self-healing command `npm run fix` before attempting manual corrections for formatting and linting issues.
3. **Pre-commit Validation**: Before committing any changes, you MUST validate the repository state by running:
   - `npm test` (Ensure all tests pass)
   - `npm run format` (Ensure formatting is correct)
   - `npm run lint` (Ensure no linting errors exist)
4. **Environment Variables**: AI scripts must exit gracefully with code `0` when `GEMINI_API_KEY` is missing to ensure CI workflows do not fail for external contributors who do not have access to repository secrets.
5. **No `console.log`**: Automation scripts and application code must use `console.info`, `console.warn`, or `console.error` instead of `console.log`. The ESLint configuration enforces this.
6. **Command Execution Safety**:
   - Avoid `execSync` with concatenated strings to prevent command injection. Use `execFileSync` with separated executable and argument arrays.
   - When using `npx` in automated scripts via `execFileSync`, always include the `--yes` flag (e.g., `npx --yes madge`) to prevent interactive prompts from causing CI workflows to hang.
7. **File Outputs**:
   - AI scripts that need to pass data to GitHub Actions (like `ai-triage.ts` or `ai-pr-review.ts`) should write their final comment or output directly to a dedicated file (e.g., `triage-comment.txt`, `pr-review-comment.txt`) using `fs.writeFileSync`, rather than piping standard output.
   - Automation scripts must ensure parent directories like `docs/history/` and `docs/architecture/` exist using `fs.mkdirSync(dir, { recursive: true })` before attempting to write outputs.
8. **GitHub Workflow Configurations**:
   - In GitHub Actions workflows, event variables must be assigned to environment variables directly in the step's `env` block and referenced in run scripts, rather than directly injected inline using `${{ }}` to prevent command injection vulnerabilities.
   - When using `thollander/actions-comment-pull-request@v3`, ensure inputs use kebab-case (e.g., `file-path`, `comment-tag`).
   - Conditionally skip action steps using file presence checks (e.g., `if: hashFiles('triage-comment.txt') != ''`) rather than step-scoped environment variables.

## Models

All AI automation scripts utilizing the Google GenAI SDK are configured to use the `gemini-2.0-flash` model for repository tasks (triage, PR review, improvement loops).
