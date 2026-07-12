# Guidelines for AI Assistants

This repository is designed to be an advanced, autonomous, self-improving, contributor-friendly, and educational open-source repository. AI assistants working on this repository MUST adhere to the following guidelines:

## Core Principle

Every repetitive task that can be automated must be automated. The repository should continuously attempt remediation before requesting human intervention.

## Self-Healing and Validation

- **Self-Healing:** Always use `npm run fix` to attempt automatic fixes for formatting, linting, and other resolvable issues before committing.
- **Pre-Commit Validation:** You MUST run the following commands before submitting any changes:
  - `npm test` (Ensure all tests pass)
  - `npm run format` (Ensure code style is consistent)
  - `npm run lint` (Ensure there are no linting errors)

## Coding Standards for Scripts

- **Console Output:** The ESLint configuration prohibits `console.log`. Automation scripts and application code MUST use `console.info`, `console.warn`, or `console.error` instead.
- **Security:** To pass Sourcery CI security checks and avoid command injection vulnerabilities, DO NOT use `execSync` with concatenated command strings. Always use `execFileSync` with separated executable and argument arrays. Note that `execFileSync` does not invoke a shell and does not support pipes (`|`); rewrite piped commands using native Node.js logic.

## GitHub Actions & Workflows

- When generating git diffs in GitHub Actions triggered by `pull_request` events, use `git diff origin/$BASE_REF...HEAD` instead of referencing `$HEAD_REF`.
- Variables like `github.base_ref` and `github.head_ref` MUST be assigned to environment variables and referenced (e.g., `$BASE_REF`) in run scripts, rather than directly injected using `${{ }}`, to prevent command injection vulnerabilities.
- When configuring the `thollander/actions-comment-pull-request@v3` GitHub Action in workflows, ensure inputs use kebab-case (e.g., `file-path`, `comment-tag`).

## Intelligence and Documentation

- The project autonomously generates and maintains a repository knowledge graph and architecture diagrams located in the `docs/` folder via the `npm run analyze:repo`, `npm run generate:diagrams`, and `npm run generate:knowledge-graph` scripts.
- Ensure any documentation generated remains updated and synchronized with the actual codebase state.
