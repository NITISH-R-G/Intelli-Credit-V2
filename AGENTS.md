# AI Agent Guidelines

This repository relies heavily on automation and AI assistance for continuous maintenance, self-healing, issue triage, code review, and project documentation. The guidelines below are for AI agents (and human contributors acting in automated roles) to ensure the repository remains a self-maintaining engineering ecosystem.

## Core Directives

- **Automation First:** Repetitive tasks must be automated.
- **Continuous Improvement:** The system must proactively identify and suggest improvements.
- **Self-Healing:** The repository should attempt remediation before requiring human intervention. Use `npm run fix` for self-healing.
- **Validation:** Always validate changes before opening Pull Requests or merging.

## Pre-commit Validation

Before any code modification is finalized (whether automatically by a script or manually), you MUST ensure the following checks pass:

1. **Self-Healing & Auto-formatting:** Run `npm run fix`. This will run ESLint auto-fix (`npm run lint:fix`) and Prettier (`npm run format`).
2. **Type Checking:** Run `npm run typecheck` to ensure no TypeScript compilation errors exist.
3. **Linting:** Run `npm run lint` to ensure code meets quality standards.
4. **Testing:** Run `npm test` to ensure tests pass and coverage is maintained.

All automated scripts opening PRs must ensure these checks are run as part of the pipeline.

## AI Roles & Scripts

The following automated scripts are present in `scripts/automation/`:

- `ai-triage.ts`: Triages new issues, adds labels, and responds with AI suggestions.
- `ai-pr-review.ts`: Reviews Pull Requests and posts suggestions as a PR comment.
- `ai-improve.ts`: Analyzes the codebase daily and opens issues with improvement suggestions.
- `analyze-repo.ts`: Generates a repository intelligence report.
- `generate-diagrams.ts` & `generate-knowledge-graph.ts`: Maintains architecture diagrams and dependency graphs using `madge`.

These scripts utilize the Google GenAI SDK (`@google/genai`) and require a valid `GEMINI_API_KEY` for operations.
