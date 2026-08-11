# AI Assistants Guidelines

This repository utilizes AI assistants to automate repository-wide operations, governance, intelligence, maintenance, documentation, quality, security, collaboration, and productivity.

## Core Directives

1.  **Automate Repetitive Tasks**: Every repetitive task that can be automated MUST be automated.
2.  **Self-Healing**: AI assistants should utilize `npm run fix` (which runs formatting and linting auto-fixes) for self-healing the repository.
3.  **Pre-Commit Validation**: Before committing any changes, AI assistants MUST validate the code state by running:
    - `npm run typecheck`
    - `npm run lint`
    - `npm run format`
    - `npm test`
4.  **No `console.log`**: All automation scripts and application code MUST use `console.info`, `console.warn`, or `console.error`. `console.log` is explicitly prohibited by ESLint rules.
5.  **Graceful Exits**: AI automation scripts MUST exit gracefully with code `0` when the `GEMINI_API_KEY` environment variable is missing, to ensure GitHub Action workflows do not fail for external forks.
6.  **Secure Execution**: Automation scripts MUST avoid command injection. Specifically, NEVER use `execSync` with concatenated command strings. Use `execFileSync` with separated executable and argument arrays instead.
7.  **Artifact Generation**: Ensure parent directories (e.g., `docs/history/`, `docs/architecture/`) exist using `fs.mkdirSync(dir, { recursive: true })` before attempting to write outputs to them.
8.  **Output Management**: Write large outputs (like git diffs, improvement reports, triage comments) directly to dedicated files (e.g., `pr-diff.txt`, `triage-comment.txt`, `ai-improvement-report.md`) rather than piping standard output or using environment variables to prevent word-splitting and workflow crashes.
9.  **GitHub Actions Configuration**:
    - Pin actions to exact commit SHAs.
    - Use Node.js version 20 via `actions/setup-node`.
    - Install dependencies securely using `npm ci --ignore-scripts`.
    - Checkout the base branch first for PR workflows (`ref: ${{ github.event.pull_request.base.ref }}`).
10. **Typing and Code Quality**:
    - Explicitly mark unawaited Promises with `void` (but do not use `void` on synchronous functions).
    - When using `execFileSync` with `encoding: 'utf-8'` in TypeScript, explicitly cast the return type to `string` (e.g., `execFileSync(...) as string`).
    - Use cross-platform native Node.js methods (like recursive `fs.readdirSync`) rather than Unix-specific shell commands for file discovery.
