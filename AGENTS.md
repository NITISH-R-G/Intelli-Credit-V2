# AI Agents Guidelines

This repository relies heavily on AI-assisted automation, self-healing, and continuous improvement.

## Guidelines for AI Assistants

1. **Automation:** All repetitive tasks must be automated.
2. **Self-Healing:** Use the command `npm run fix` for self-healing the codebase (formatting, linting fixes).
3. **Pre-commit Checks:** Before any commit or submission, you must run the following validation commands to ensure the code is clean and passes all checks:
   - `npm test`
   - `npm run format`
   - `npm run lint`

## Scripts

- Code execution for AI relies on TypeScript files under `scripts/automation/`.
- Ensure output is written to expected files (e.g., `triage-comment.txt`, `pr-comment.txt`) rather than stdout where possible.
