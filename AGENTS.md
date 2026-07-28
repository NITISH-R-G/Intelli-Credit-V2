# AI Assistant Guidelines (AGENTS.md)

This file contains guidelines for AI assistants interacting with this repository.

## Core Directives

1. **Automate Everything**: Maximize repository automation, self-healing, and contributor experience utilizing GitHub Actions, Dependabot, CodeQL, and custom AI scripts in `scripts/automation/`.
2. **Self-Healing**: Always attempt to fix formatting and linting issues automatically by running `npm run fix` before committing.
3. **Pre-commit Validation**: Before submitting code, the following must pass:
   - `npm test`
   - `npm run typecheck`
   - `npm run lint`
   - (Or simply `npm run fix` followed by `npm test`)
4. **No Console Logs**: Use `console.info`, `console.warn`, or `console.error` instead of `console.log`.
5. **Security**: Ensure no sensitive data like `GEMINI_API_KEY` is logged or passed inappropriately. AI scripts must degrade gracefully (exit code 0) if the key is missing to prevent PR failure for external forks.

## Automation Scripts Overview
- **Issue Triage**: `npm run ai:triage`
- **PR Review**: `npm run ai:pr-review`
- **Improvement Loop**: `npm run ai:improve`
- **Repository Analysis**: `npm run analyze:repo`
- **Diagram Generation**: `npm run generate:diagrams`
- **Knowledge Graph Generation**: `npm run generate:knowledge-graph`

## Specific Tools Usage
- AI scripts use `gemini-2.0-flash` for repository tasks.
- The `madge` tool requires `graphviz` to be installed on the system to generate diagrams.
- When generating git diffs in GitHub Actions (for `pull_request`), use `git diff origin/$BASE_REF...HEAD`.
- Always verify outputs by writing directly to files (e.g., `triage-comment.txt`, `pr-comment.txt`, `ai-improvement-report.md`) instead of piping via standard output.