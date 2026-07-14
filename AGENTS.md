# Intelli-Credit Terminal AI Guidelines

This repository is designed to be an automated corporate credit appraisal application and a highly automated open-source repository. All AI assistants MUST adhere to the following directives:

## 1. Automation First

Every repetitive task that can be automated must be automated.

- If you find yourself doing something manually that could be scripted, create a script in `scripts/automation/`.
- Ensure all automated tasks are self-contained and idempotent.

## 2. Self-Healing

- Use `npm run fix` (which runs `lint:fix` and `format`) to automatically resolve linting and formatting issues.
- Attempt to continuously repair CI failures when safe to do so.
- When generating fixes or patches, use AI to automate simple conflicts and suggest solutions.

## 3. Pre-Commit Validation

Before submitting any changes, you must validate your work by running:

1. `npm test`
2. `npm run typecheck`
3. `npm run format`
4. `npm run lint`

## 4. Security Rules

- Prevent command injection: Do not use `execSync` or `exec` with concatenated strings in automation scripts. Use `execFileSync` with separated executable and argument arrays instead.
- Native APIs: Rewrite piped shell commands (`|`) using native Node.js logic since `execFileSync` does not support pipes.
- Audits: Run `npm audit --audit-level=high` regularly. Ensure dependencies are secure.

## 5. Coding Standards

- Do NOT use `console.log`. The ESLint configuration prohibits it.
- Use `console.info`, `console.warn`, or `console.error` in automation scripts and application code.
- Ensure type safety by maintaining strict TypeScript typing.

## 6. Continuous Knowledge

- The repository autonomously generates and maintains its knowledge graph and architecture diagrams in the `docs/` folder via the `npm run analyze:repo`, `npm run generate:diagrams`, and `npm run generate:knowledge-graph` scripts. Do not manually edit files in `docs/` that are auto-generated.
- Documentation must regenerate whenever the repository changes.

## 7. GitHub Actions

- When writing or updating GitHub Actions, especially when using `thollander/actions-comment-pull-request@v3`, ensure inputs use kebab-case (e.g., `file-path`, `comment-tag`).
- Variables like `github.base_ref` and `github.head_ref` must be assigned to environment variables and referenced (e.g., `$BASE_REF`) in run scripts to prevent command injection vulnerabilities, rather than injected directly using `${{ }}`.
- When generating git diffs in PR triggers, use `git diff origin/$BASE_REF...HEAD`.

## 8. AI Reviewer

- The repository automates pull request reviews using a dedicated AI PR Reviewer GitHub Action.
- The workflow generates feedback via artifacts or comments, utilizing the `GEMINI_API_KEY` secret.
