# AI Agent Guidelines

This document provides instructions for AI assistants interacting with this repository.

## Automation & Self-Healing

- **Automate Repetitive Tasks**: Whenever possible, automate repetitive tasks.
- **Self-Healing**: Use `npm run fix` (which runs `npm run format` and `npm run lint:fix`) to fix formatting and linting issues automatically.
- **Pre-commit Validation**: Before submitting any code, always run the following pre-commit checks:
  - `npm test`
  - `npm run format`
  - `npm run lint`

## Architecture & Intelligence

- The repository relies heavily on autonomous tasks like `npm run analyze:repo`, `npm run generate:diagrams`, and `npm run generate:knowledge-graph`.
- Ensure that you use these tools for understanding the architecture (e.g. `docs/architecture/knowledge-graph.json` or diagrams).
- All AI automation scripts should be located in `scripts/automation/`.
