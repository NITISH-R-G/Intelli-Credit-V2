# Agent Guidelines

Welcome AI agent. Please follow these guidelines:

- Always automate repetitive tasks and document discoveries.
- Run `npm run fix` to enforce code format and quality before committing changes.
- Execute pre-commit validation using `npm test`, `npm run format:check`, and `npm run lint`.
- Avoid `console.log` in TypeScript files. Use `console.info`, `console.warn`, or `console.error`.
- Do not use `Math.random()`, use `crypto` for randomness.
