# Agent Guidelines for Intelli-Credit Terminal

Welcome, AI Contributor. You are an essential part of the core maintenance team for this repository.
This document provides guidelines, constraints, and instructions for how you should operate in this repository.

## Automation and Self-Healing
* **Always run `npm run fix`**: For self-healing workflows, rely on `npm run fix` (which you will ensure is configured in `package.json`).
* **Pre-commit validation**: Always run `npm test`, `npm run format`, and `npm run lint` before committing any changes.
* **No `console.log`**: Use `console.info`, `console.warn`, or `console.error` in application code and automation scripts to pass ESLint rules.
* **Strict Typing**: TypeScript code must explicitly mark unawaited Promises with `void` (e.g., `void triage();`) to pass SonarCloud quality gates and strict ESLint checks. However, do NOT use `void` on synchronous functions, as SonarCloud flags this as a vulnerability.

## AI Script Implementations (in `scripts/automation/`)
* **Real API Calls**: Automation scripts MUST use the `@google/genai` SDK by initializing the client via `new GoogleGenAI({ apiKey })`, rather than mock functions. Use `gemini-2.0-flash`.
* **Graceful Exit**: AI scripts must exit gracefully with code `0` when `GEMINI_API_KEY` is missing to support external contributors.
* **File Output**: AI scripts should write their final comment or output directly to dedicated files (e.g., `triage-comment.txt`, `pr-comment.txt`, `ai-improvement-report.md`) utilizing `fs.writeFileSync`, rather than piping standard output.
* **Directory Creation**: Scripts must ensure parent directories like `docs/history/` and `docs/architecture/` exist using `fs.mkdirSync(dir, { recursive: true })` before attempting to write outputs.
* **Safe Command Execution**:
  - To prevent command injection and TS2352 type overlap errors, use `execFileSync` instead of `execSync` with concatenated strings.
  - When using `execFileSync` with `encoding: 'utf-8'`, explicitly cast the result: `(execFileSync(...) as unknown as string)`. If using no encoding string, explicitly cast: `(execFileSync(...) as unknown as Buffer).toString()`.
  - When executing `npx` commands within automated Node.js scripts (via `execFileSync`), always include the `--yes` flag (e.g., `npx --yes madge`).
* **Native Node vs Shell**: Use cross-platform native Node.js methods like recursive `fs.readdirSync` rather than Unix-specific shell commands (e.g., `find`) for file discovery.
* **Code Content**: To prevent hallucination, AI scripts (e.g., `ai-improve.ts`, `analyze-repo.ts`) must explicitly read and include the source code content of `.ts` and `.tsx` files from key directories (`src/`, `api/`, `scripts/`) into the generation prompt.

## GitHub Actions Workflows
* **Node Version**: Workflows utilizing `actions/setup-node` should be configured to use `node-version: 20`.
* **Dependency Installation**: In `pull_request` workflows, use `npm ci --ignore-scripts` to mitigate the risk of executing malicious postinstall scripts from untrusted forks.
* **Workflow SHAs**: To pass SonarCloud security checks, ALL GitHub Actions in workflow files must be pinned to exact commit SHAs (e.g., `uses: actions/checkout@11d5960...`) rather than version tags (e.g., `@v4`).
* **Safe PR Checking**: For AI PR review workflows, checkout the base branch (`ref: ${{ github.event.pull_request.base.ref }}`) first to ensure trusted automation scripts are run securely.
* **Diff Fetching**: When generating git diffs in `pull_request` workflows, fetch the PR diff directly from the GitHub API using `curl` with `Accept: application/vnd.github.v3.diff` (e.g., against `${{ github.event.pull_request.url }}`) and save to a file (e.g., `pr-diff.txt`), read it via `fs.readFileSync`. Do not rely on `git diff`, `git fetch`, or shell variables.
* **Event Payloads**: Read the event payload directly from `process.env.GITHUB_EVENT_PATH` using `fs.readFileSync` and `JSON.parse`. Do not inject `github.event.*` variables into the environment.
* **Dependencies Updates**: Utilize Dependabot via `.github/dependabot.yml` for `npm` and `github-actions`.
* **Comments & PRs**:
  - Use `peter-evans/create-or-update-comment` for automated issue triage responses.
  - Use `peter-evans/create-issue-from-file` for AI Continuous Improvement loop recommendations.
  - Use `peter-evans/create-pull-request` for self-healing/documentation automation.
  - Use `thollander/actions-comment-pull-request` for PR reviews. Ensure inputs use kebab-case (e.g., `file-path`, `comment-tag`) and conditionally skip using file presence checks (e.g., `if: hashFiles('pr-comment.txt') != ''`).
  - DO NOT install GitHub Action packages as local npm dependencies.

## Architecture and Documentation
* The repository's architecture diagram generation script uses `madge`. Ensure `graphviz` is installed (e.g., `sudo apt-get install -y graphviz`) in GitHub Actions CI workflows.

## UI/React Rules
* React `<button>` elements must possess an explicit `type` attribute (e.g., `type="button"`) to satisfy SonarCloud and linting rules.
