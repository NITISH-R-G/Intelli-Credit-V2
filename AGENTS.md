# AI Assistant Guidelines

Welcome to the Intelli-Credit Terminal repository. When interacting with this repository, AI agents must adhere to the following guidelines to maintain a world-class, autonomous, and self-improving system.

## Core Directives

1.  **Automate Repetitive Tasks**: Every repetitive task must be automated. Write scripts to reduce human intervention.
2.  **Self-Healing**: Always use `npm run fix` before attempting manual fixes for linting or formatting issues. The repository should heal itself.
3.  **Pre-Commit Validation**: Before submitting any code changes, you MUST run pre-commit validations to ensure repository integrity. These include:
    *   `npm run typecheck`
    *   `npm run lint`
    *   `npm run format:check`
    *   `npm test`
4.  **No `console.log`**: Never use `console.log`. Use `console.info`, `console.warn`, or `console.error`.
5.  **Strict Typing**: Ensure all TypeScript files are strictly typed.
6.  **Secure Environments**: Never expose secrets or API keys in code or client-side bundles.
7.  **Generate Documentation**: Documentation must be kept in sync. Use AI automation to ensure no documentation drift occurs.
