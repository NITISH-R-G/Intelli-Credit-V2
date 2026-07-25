# AI Agent Guidelines

This repository relies heavily on automated intelligence and autonomous actions to continuously improve quality, architecture, documentation, and workflows.

When performing tasks in this repository, follow these core rules:

1. **Automation:** Automate repetitive tasks wherever possible.
2. **Self-Healing:** Always attempt to use `npm run fix` (which runs `npm run lint:fix` and `npm run format`) to let the repository self-heal.
3. **Pre-Commit Validation:** Before concluding any code modification step, you MUST validate your changes by running:
   - `npm test`
   - `npm run format`
   - `npm run lint`
4. **Script Execution:** When running automation scripts inside node.js (`execFileSync`), use explicit string casting for the response and avoid command concatenations that could lead to command injection.
5. **No console.log:** Do not use `console.log` anywhere in the codebase. Use `console.info`, `console.warn`, or `console.error`.
6. **Robust AI Scripts:** All AI automation scripts in `scripts/automation/` must gracefully exit with a `0` code when `GEMINI_API_KEY` is not present, so that workflows do not fail for external open-source forks.

## Repository Knowledge Base

Use the generated `docs/architecture/knowledge-graph.json` and diagrams to help you navigate and understand the application.
