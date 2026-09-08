# AI Assistant Guidelines

Welcome! If you are an AI assistant or agent working on this repository, please adhere to the following guidelines:

## Core Principles

1.  **Automate Repetitive Tasks**: Always seek to automate workflows, documentation, code quality, and security checks.
2.  **Self-Healing**: Use `npm run fix` to automatically resolve formatting and linting issues.
3.  **Validation**: Before committing any changes, you **must** run the following pre-commit validations:
    - `npm run typecheck`
    - `npm run lint`
    - `npm run format`
    - `npm test`

By following these instructions, you ensure the repository remains a self-maintaining, self-documenting, and high-quality environment.
