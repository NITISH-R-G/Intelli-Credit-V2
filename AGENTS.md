# AI Assistant Guidelines (AGENTS.md)

Welcome, AI Assistant! This repository is an advanced, autonomous open-source system. Follow these guidelines carefully to ensure the repository remains secure, self-healing, and well-maintained.

## Core Directives

1. **Automation of Repetitive Tasks**: Every repetitive task that can be automated must be automated. Use scripts to manage documentation, triage issues, review PRs, and analyze the architecture.
2. **Self-Healing**: Continuously attempt remediation before requesting human intervention. Use `npm run fix` (which handles linting and formatting autofixes) as part of self-healing automation.
3. **Pre-commit Validation**: Before submitting any code changes, you must validate them using:
   - `npm test` (for unit testing)
   - `npm run format` (or `npm run format:check` for checking)
   - `npm run lint`

## Codebase Constraints and Style

1. **No `console.log`**: The project's ESLint configuration prohibits `console.log`. Use `console.info`, `console.warn`, or `console.error` instead in application code and automation scripts.
2. **React Elements**: React `<button>` elements must possess an explicit `type` attribute (e.g., `type="button"`) to satisfy SonarCloud and linting rules.
3. **Node.js Imports**: In TypeScript files, use namespace imports for Node.js built-in modules (e.g., `import * as fs from 'node:fs'`) instead of default imports.
4. **Child Processes**: Avoid using `execSync` with concatenated command strings to prevent command injection. Use `execFileSync` with separated executable and argument arrays. When using `execFileSync` without an encoding string, explicitly cast the result using `(execFileSync(...) as unknown as Buffer).toString()`. If using `encoding: 'utf-8'`, explicitly cast to string (e.g., `execFileSync(...) as string`).
5. **Promises**: TypeScript code must explicitly mark unawaited Promises with `void` (e.g., `void triage();`) to pass strict ESLint checks. Do not use `void` on synchronous functions.
6. **File System Discovery**: For file discovery in Node.js scripts, use cross-platform native Node.js methods like recursive `fs.readdirSync` rather than Unix-specific shell commands (e.g., `find`).
7. **Directory Creation**: AI automation scripts must ensure parent directories like `docs/history/` and `docs/architecture/` exist using `fs.mkdirSync(dir, { recursive: true })` before writing outputs.
8. **Logging in Actions**: To avoid logging noise in GitHub Actions, scripts should write their final output directly to dedicated files (e.g., `triage-comment.txt`, `pr-comment.txt`) utilizing `fs.writeFileSync`, rather than piping standard output.

## GitHub Actions & Automation

1. **Permissions**: GitHub Actions workflows should explicitly define minimum job or workflow permissions (e.g., `permissions: contents: read` along with specific required write permissions).
2. **Node Version**: GitHub Action workflows utilizing `actions/setup-node` should be configured to use `node-version: 20`.
3. **Security Pinning**: To pass SonarCloud security checks, all GitHub Actions in workflow files must be pinned to exact commit SHAs (e.g., `uses: actions/checkout@11d5960...`) rather than version tags.
4. **Untrusted Input**: In workflows triggered by `pull_request` events, use `npm ci --ignore-scripts` to mitigate the risk of executing malicious postinstall scripts.
5. **PR Reviews**: Checkout the base branch (`ref: ${{ github.event.pull_request.base.ref }}`) first to ensure trusted automation scripts run securely. Fetch the PR diff directly from the GitHub API using `curl` with `Accept: application/vnd.github.v3.diff` into a file like `pr-diff.txt`, and read it via `fs.readFileSync`. Do not pass diffs via environment variables.
6. **Event Payloads**: Read event payload directly from `process.env.GITHUB_EVENT_PATH` using `fs.readFileSync` and `JSON.parse` rather than injecting `github.event.*` variables.
7. **Commenting on PRs**: When configuring the `thollander/actions-comment-pull-request` action, ensure inputs use kebab-case (e.g., `file-path`, `comment-tag`). Conditionally skip the step using file presence checks (`if: hashFiles('pr-comment.txt') != ''`).
8. **Non-interactive Commands**: When executing `npx` commands within automated Node.js scripts (via `execFileSync`), always include the `--yes` flag (e.g., `npx --yes madge`).
9. **Graceful Failures**: AI scripts must exit gracefully with code `0` when `GEMINI_API_KEY` is missing to ensure workflows do not fail for external open-source contributors.
