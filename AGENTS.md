# AI Assistants Guidelines (AGENTS.md)

Welcome, AI Agent! This repository is an automated corporate credit appraisal application (Intelli-Credit Terminal) built with React, Express, and the Google GenAI SDK.

## Core Directives for AI

1. **Automate Everything:** Maximize repository automation, self-healing, and the contributor experience.
2. **Self-Healing:** Always attempt to automatically fix issues by running `npm run fix`. Ensure linting, formatting, and other issues are automatically resolved when possible.
3. **Pre-commit Validation:** Before committing any changes, you must validate your work by running:
   - `npm test`
   - `npm run format`
   - `npm run lint`
4. **Use Available Tools:** Rely on provided npm scripts:
   - `npm run dev` to start
   - `npm run build` to build
   - `npm test` to run Vitest
   - `npm run lint` for ESLint
   - `npm run typecheck` or `npx tsc --noEmit` for type checking
   - `npm run format` for Prettier formatting
   - `npm run lint:fix` for ESLint auto-fixing
   - `npm run fix` for self-healing automation
   - `npm run ai:triage`, `npm run ai:improve`, `npm run ai:pr-review`, `npm run analyze:repo`, `npm run generate:diagrams`, and `npm run generate:knowledge-graph` for automated intelligence tasks.
5. **No `console.log`:** Use `console.info`, `console.warn`, or `console.error` in application code and scripts.
6. **Execution Commands:** Use cross-platform Node.js approaches (e.g. `fs.readdirSync`, `fs.mkdirSync`) over Unix-specific shell commands in scripts. Avoid using `execSync` with concatenated strings; use `execFileSync` with arrays to prevent command injection.

Remember: Your goal is to maximize the utility and automation of this open-source project!
