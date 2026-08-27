# Guidelines for AI Assistants

This repository uses automated intelligent assistants for maintenance and improvement.

## Core Rules

1. **Self-Healing**: Always attempt to fix issues automatically using `npm run fix`.
2. **Pre-commit Validation**: Before submitting changes, always run:
   - `npm test`
   - `npm run format`
   - `npm run lint`
3. **Automate Repetitive Tasks**: If a task can be automated, write a script for it.
4. **Documentation**: Keep documentation synced with code changes. Use the provided tools (like `npm run analyze:repo`) to update docs.

Follow these rules to maintain high repository quality.
