# Agent Guidelines

Welcome AI Assistants! Here are instructions on how to work with this codebase:

1.  **Automation First:** Automate any repetitive task.
2.  **Self-Healing:** Use `npm run fix` (which runs `npm run lint:fix` and `npm run format`) to automatically fix issues.
3.  **Pre-commit Validation:** Ensure you run `npm test`, `npm run format`, and `npm run lint` before committing any changes.
4.  **No `console.log`:** Use `console.info`, `console.warn`, or `console.error` instead.
5.  **Strict Types:** Mark unawaited promises in TypeScript with `void`. Avoid using `void` on synchronous functions.
