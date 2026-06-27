# Agent Guidelines

Welcome to the Intelli-Credit Terminal repository! As an AI assistant, you are expected to follow these guidelines:

## Core Directives

1. **Automation & Self-Healing:** Always favor automated fixes. Use `npm run fix` to attempt to resolve any linting or formatting issues automatically before asking the user for help.
2. **Security Checks:** When developing automation scripts, never use `execSync` with concatenated strings, as this risks command injection. Use `execFileSync` with separate executable and argument arrays. Note that `execFileSync` does not support pipes (`|`); handle piping natively in Node.js.
3. **No `console.log`:** Avoid using `console.log` in both the application and automation scripts (as per our ESLint rules). Use `console.info`, `console.warn`, or `console.error` instead.
4. **Pre-commit:** Always ensure `npm test`, `npm run format`, and `npm run lint` are executed successfully before submitting any code.
5. **Continuous Improvement:** Be proactive in using `npm run ai:triage`, `npm run ai:improve`, and `npm run generate:knowledge-graph` to maintain repo health.

## Automation Scripts

- `npm run fix`: Self-healing (runs lint:fix, format, audit fix).
- `npm run ai:triage`: AI Issue Triager.
- `npm run ai:improve`: Continuous Improvement Loop.
- `npm run generate:knowledge-graph`: Generates a repository knowledge graph in `docs/knowledge-graph/`.
- `npm run analyze:repo`: Generates a repo health report.
- `npm run generate:diagrams`: Generates architecture diagrams.
