# AI Assistant Guidelines

Welcome, AI Assistants! This repository relies on advanced automation, self-healing, and intelligence.
When working in this repository, you must adhere strictly to the following guidelines:

## Core Directives

1. **Automate Repetitive Tasks**: Any task that can be automated must be automated.
2. **Self-Healing**: Always attempt to fix issues automatically using the `npm run fix` command for self-healing operations (linting, formatting, file integrity).
3. **Pre-Commit Validation**: Before committing any changes, you must validate them using:
   - `npm test` (to ensure tests pass)
   - `npm run format` (to ensure code is properly formatted)
   - `npm run lint` (to ensure code adheres to linting rules)

## Automation and Scripting Rules

- Use native Node.js methods (e.g., recursive `fs.readdirSync`) for cross-platform compatibility instead of Unix-specific shell commands like `find`.
- AI scripts reading from the codebase (e.g., `ai-improve.ts`, `analyze-repo.ts`) must explicitly read and include the source code content of `.ts` and `.tsx` files from key directories (`src/`, `api/`, `scripts/`).
- When using `execFileSync` in TypeScript, explicitly cast the result using `(execFileSync(...) as unknown as Buffer).toString()` or similar native string casting to avoid type errors.
- Do not use `execSync` with concatenated command strings. Use `execFileSync` with separated executable and argument arrays to prevent command injection.
- AI scripts must write their final outputs directly to dedicated files (e.g., `triage-comment.txt`, `pr-comment.txt`, `ai-improvement-report.md`) utilizing `fs.writeFileSync`, rather than piping standard output.
- Ensure parent directories like `docs/history/` and `docs/architecture/` exist using `fs.mkdirSync(dir, { recursive: true })` before writing outputs.
- Initialize the Google GenAI client properly via `new GoogleGenAI({ apiKey })` using the `@google/genai` SDK and use the `gemini-2.0-flash` model.
- AI scripts must exit gracefully with code `0` when `GEMINI_API_KEY` is missing to support open-source contributions.

## GitHub Actions CI/CD Rules

- Fetch PR diffs directly from the GitHub API using `curl` with `Accept: application/vnd.github.v3.diff` instead of relying on `git diff` or `git fetch`.
- Save large text outputs (like git diffs) to a file (e.g., `pr-diff.txt`) and read via Node.js rather than passing through environment variables.
- Ensure minimum job permissions are defined (`permissions: contents: read`) with specific required write permissions.
- Workflows using `actions/setup-node` must use `node-version: 20`.
- In `pull_request` events, checkout the base branch first to execute trusted scripts safely.
- Use `npm ci --ignore-scripts` to install dependencies in PR workflows.
- All GitHub Actions in workflow files must be pinned to exact commit SHAs.
- Read dynamic event data (like issue bodies) directly from `process.env.GITHUB_EVENT_PATH` using `fs.readFileSync` and `JSON.parse`.
- Use the `thollander/actions-comment-pull-request` action with kebab-case inputs (`file-path`) and conditionally skip using file presence checks (`if: hashFiles('pr-comment.txt') != ''`).

## Code Standards

- React `<button>` elements must possess an explicit `type` attribute.
- The project's ESLint configuration prohibits `console.log`. Use `console.info`, `console.warn`, or `console.error` instead.
- TypeScript code must explicitly mark unawaited Promises with `void` (e.g., `void triage();`), except on synchronous functions.

By following these guidelines, we maintain a resilient, secure, and self-improving open-source ecosystem.
