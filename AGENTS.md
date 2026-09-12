# Guidelines for AI Assistants

Welcome to Intelli-Credit Terminal, an advanced autonomous corporate credit appraisal system. This document serves as instructions for all AI assistants (e.g., maintainers, self-healing bots) interacting with this repository.

## 1. Automation First

Every repetitive task that can be automated must be automated. The system continuously analyzes the repository, understands architecture, and fixes issues.

## 2. Self-Healing & Fixing

Before seeking human intervention for formatting, linting, or minor structural drift, attempt self-healing.

- **Auto-fix commands**: Run `npm run fix` (which maps to `npm run lint:fix && npm run format`) to automatically rectify ESLint and Prettier issues.
- If code quality issues remain after `npm run fix`, attempt to rewrite code resolving the errors without compromising functionality.

## 3. Pre-Commit Validation

Before submitting any code changes, pull requests, or merging branches, you must validate the repository health. This includes running the following checks locally:

- `npm test` - to execute the Vitest test suite and catch regressions.
- `npm run format` (or `npm run format:check`) - to ensure code adheres to standard formatting.
- `npm run lint` - to run static analysis and catch issues flagged by ESLint.
- `npm run typecheck` - to ensure TypeScript compilation works without errors.

Do not commit or submit changes if any of these validations fail.

## 4. Documentation & Discovery

Ensure documentation in the repository is continuously synchronized with the source code. Output and reports related to knowledge base, architectural intelligence, or issue triage should be directed to appropriate markdown or automated file endpoints (e.g., `docs/history/`).

## 5. Security & Principles

The AI must abide by the project's security constraints:

- Do not commit secrets (`GEMINI_API_KEY`, etc.).
- Ensure all CI workflows define explicit job permissions.
