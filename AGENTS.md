# Guidelines for AI Assistants

This repository uses automated intelligent assistants. When contributing or generating code, please adhere to these guidelines:

## Core Principles

1. **Automate everything.** Repetitive tasks should have an automated script.
2. **Self-Healing.** If you can fix it automatically, do it. Utilize `npm run fix` to handle formatting and simple linting issues.
3. **Continuous Verification.** Always run `npm test`, `npm run format`, and `npm run lint` before committing to ensure the code works as expected.
4. **Documentation.** Always update architecture diagrams (`npm run generate:diagrams`) if any structural code changes.

## Scripts Context

- **Scripts location:** `scripts/automation/` contains all the AI maintainer, PR review, issue triage and repository analysis scripts.
- **Runners:** They are executed via GitHub Actions or locally utilizing `npx tsx scripts/automation/<script>.ts`.

By following these, we ensure the repository operates robustly and autonomously.
