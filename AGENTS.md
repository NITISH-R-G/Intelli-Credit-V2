# AI Agent Guidelines

Welcome to the Intelli-Credit Terminal repository. This document outlines guidelines for AI assistants contributing to and maintaining this project.

## Automation and Self-Healing
* **Automate Everything:** Any repetitive task that can be automated must be.
* **Self-Healing:** Before asking for human intervention, continuously attempt to self-heal using scripts like `npm run fix`.
* **Autonomous Intelligence:** The repository relies on automation scripts in `scripts/automation/` to review PRs, triage issues, and generate documentation. Do not modify the core logic of these files without a full understanding of their role in the continuous improvement loop.

## Code Quality and Rules
* Ensure that React `<button>` elements have an explicit `type` attribute (e.g., `type="button"`).
* Avoid using `console.log`. Use `console.info`, `console.warn`, or `console.error` instead.
* In automated Node.js scripts, use native Node.js methods like recursive `fs.readdirSync` instead of shell commands like `find`.
* When using `execFileSync` in TypeScript, do not use concatenated command strings (to prevent injection). Avoid using the shell or pipes (`|`). If using `encoding: 'utf-8'`, cast the result explicitly to string (e.g., `(execFileSync(...) as string)`). If not specifying encoding, explicitly cast to Buffer before toString (e.g., `(execFileSync(...) as unknown as Buffer).toString()`).
* Explicitly mark unawaited Promises with `void` (e.g., `void myFunction();`). Do not use `void` on synchronous functions.
* Automation scripts must use `@google/genai` with model `gemini-2.0-flash`. The scripts should gracefully exit with code 0 if `GEMINI_API_KEY` is not present, to support PRs from external forks.
* In GitHub Actions, pass inputs securely by reading them from the environment or files (like `process.env.GITHUB_EVENT_PATH` or `pr-diff.txt`), instead of using command substitution or `$GITHUB_EVENT_` variables in bash arrays.
* Scripts that output files or write to nested paths (like `docs/architecture/` or `docs/history/`) must create the directories first using `fs.mkdirSync(dir, { recursive: true })`.

## Pre-commit Verification
Before committing and pushing code changes, AI assistants must run pre-commit validations to ensure high quality:
* `npm run format`
* `npm run lint`
* `npm test`
* `npm run typecheck`
If any of these fail, fix the issues before proceeding.

## Repository Architecture & Knowledge
* The repo uses a continuous improvement loop, generating issue recommendations into `ai-improvement-report.md`.
* Issue triage bots write output to `triage-comment.txt`.
* AI PR reviewers write output to `pr-comment.txt`.
* Architecture diagrams (via `madge`) and knowledge graphs are automatically generated into `docs/architecture/`.

By following these rules, AI agents contribute to maintaining an autonomous, secure, and self-improving engineering ecosystem.
