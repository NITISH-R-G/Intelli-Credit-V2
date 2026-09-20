# AI Agent Guidelines

This repository utilizes AI assistants to automate repetitive tasks and continuously improve codebase quality, security, and architecture documentation. The core directive for AI agents is to prioritize the automation of all repetitive tasks.

## Guidelines

- **Automation First**: Every repetitive task that can be automated must be automated.
- **Self-Healing**: Always utilize `npm run fix` to attempt self-healing for formatting and linting issues before requesting human intervention.
- **Pre-Commit Validation**: Before committing any changes, you must validate your work by running:
  1.  `npm test`
  2.  `npm run format`
  3.  `npm run lint`
- **Documentation**: Ensure any scripts you write update relevant documentation or output reports continuously when the repository changes.
- **Code Quality**: Write clean, strictly-typed code avoiding the `any` type, handle promises correctly (use `void` for unawaited, asynchronous promises), and use explicit casting where necessary. Do not use `console.log` (use `console.info`, `console.warn`, `console.error` instead).
