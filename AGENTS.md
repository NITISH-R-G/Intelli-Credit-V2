# AI Agent Guidelines

This repository relies on automated AI maintainers and agents.

## Capabilities

- AI Issue Triage (`npm run ai:triage`)
- AI PR Review (`npm run ai:pr-review`)
- Daily Continuous Improvement (`npm run ai:improve`)
- Architecture Analysis and Dependency Graphing (`npm run analyze:repo`)
- Automated Self-Healing (`npm run fix`)

## Guidelines for AI Contributors

- **Model Usage**: Use `gemini-2.0-flash` for repository tasks.
- **Typing Rules**: Strict TypeScript is enforced. Do not use the `any` type (prefer `Record<string, unknown>`). Unused variables in catch blocks should be omitted (`catch {}`). Unawaited Promises should be marked with `void` (e.g., `void myFunc()`), but `void` should not be used on synchronous functions.
- **Logging**: Do not use `console.log`. Use `console.info`, `console.warn`, or `console.error`.
- **Pre-Commit**: Always ensure pre-commit steps are validated using `npm test`, `npm run format:check`, and `npm run lint`.
- **Execution**: Scripts should run via `npx --yes tsx`. Ensure missing environment variables (e.g., `GEMINI_API_KEY`) lead to a graceful exit with code `0`.
- **Formatting**: Code formatting is enforced using Prettier (`npm run format`).
- **Dependencies**: Use ES module imports in TypeScript (`import * as fs from 'node:fs'`).
