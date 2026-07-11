# AGENTS.md

This file contains guidelines for AI assistants and automation tools interacting with this repository.

## Core Directives

1. **Automation:** Every repetitive task that can be automated must be automated.
2. **Self-Healing:** Always attempt to automatically fix issues. Use `npm run fix` to self-heal formatting and linting issues.
3. **Pre-commit Validation:** Before committing any changes, you MUST run:
   - `npm test`
   - `npm run format`
   - `npm run lint`

## Security & Execution

1. **Command Execution:** Do not use `execSync` with concatenated command strings in automation scripts (this prevents command injection). Instead, use `execFileSync` with separated executable and argument arrays. Note that `execFileSync` does not invoke a shell and does not support pipes (`|`); rewrite piped commands using native Node.js logic.
2. **Logging:** Do not use `console.log`. The project's ESLint configuration prohibits it. Use `console.info`, `console.warn`, or `console.error` instead.
3. **GitHub Actions:** When dealing with pull requests in workflows, variables like `github.base_ref` and `github.head_ref` MUST be assigned to environment variables and referenced (e.g., `$BASE_REF`) in run scripts, rather than directly injected using `${{ }}`, to prevent command injection vulnerabilities.
4. **Third-party Actions:** When configuring the `thollander/actions-comment-pull-request@v3` GitHub Action, ensure inputs use kebab-case (e.g., `file-path`, `comment-tag`) as older formats will cause CI failures.

## AI Tasks

The repository uses the following AI scripts located in `scripts/automation/` (run via `tsx`):

- `npm run ai:triage`
- `npm run ai:improve`
- `npm run ai:pr-review`
- `npm run analyze:repo`
- `npm run generate:diagrams`
- `npm run generate:knowledge-graph`

The project autonomously generates and maintains a repository knowledge graph and architecture diagrams located in the `docs/` folder via the analysis scripts.

## Dependencies

Keep dependencies secure. Run `npm audit --audit-level=high` and fix vulnerabilities.
