# Guidelines for AI Assistants

This repository follows strict guidelines for automated governance, intelligence, maintenance, documentation, quality, and security.

## Core Rules

1.  **Automation of Repetitive Tasks**: Every repetitive task that can be automated must be automated. Scripts inside `scripts/automation/` handle repository triage, PR review, and continuous improvement.
2.  **Self-Healing**: Autonomous scripts and workflows rely on the `npm run fix` command for self-healing. This command auto-formats and automatically fixes linting issues.
3.  **Pre-Commit Validation**: Before any commit is merged or finalized, the following validations must be run and pass:
    - `npm test`
    - `npm run format` (or `npm run format:check`)
    - `npm run lint`
    - (Optionally) `npm run typecheck`
4.  **AI Maintainer System**: We rely on the Gemini API (`gemini-2.0-flash`) as our AI-powered maintainer. AI should provide actionable feedback, suggest fixes, and automatically open issues or PRs when possible.
5.  **Autonomous Documentation**: Architecture documentation, API docs, and dependency graphs (`docs/architecture/`) are autonomously generated using Madge. AI loops also update reports like `docs/history/ai-improvement-report.md`.
6.  **Code Quality**: Maintain the highest standard of quality. Do not introduce dead code or ignore linting rules unnecessarily. Type safety must be strict (avoid `any` where possible).
7.  **No Extraneous Logs**: Application code and automation scripts must avoid `console.log`. Use `console.info`, `console.warn`, or `console.error` instead.
8.  **GitHub Feature Utilization**: Maximize free GitHub features, including Actions for self-healing, triage, auto-assigning, and scheduled updates. Dependabot handles security and dependency updates.

When modifying this repository, ensure your plans adhere to these constraints and always verify code correctness before concluding.
