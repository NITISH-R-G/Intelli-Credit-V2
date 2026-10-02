# Agent Guidelines

Welcome AI Assistants! When interacting with this repository, please adhere to the following guidelines:

## Core Principles

- Automate every repetitive task possible.
- Continuously strive for a self-healing, autonomous, and self-documenting system.

## Automation & Self-Healing

- Use `npm run fix` for self-healing, formatting, and linting automation. The repository attempts to automatically repair formatting and style issues using Prettier and ESLint.

## Code Quality & Pre-commit Steps

Before committing any changes, you must validate your work. Pre-commit validation requires the following checks to pass:

1.  Run tests: `npm test`
2.  Format code: `npm run format`
3.  Lint code: `npm run lint`
4.  Type check: `npm run typecheck`

Ensure the codebase remains high quality and adheres to our stringent testing and stylistic standards.

## Project Structure and Scripts

- AI automation scripts are located in `scripts/automation/`.
- Repostitory intelligence outputs (diagrams, graphs, reports) belong in `docs/architecture/` and `docs/history/`.
