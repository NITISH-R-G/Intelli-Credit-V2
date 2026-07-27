# Agent Guidelines

Welcome to the Intelli-Credit repository! When working on this codebase, AI agents must adhere to the following principles:

1. **Automation & Self-Healing**: Automate repetitive tasks whenever possible. Use tools like `npm run fix` (`npm run lint:fix && npm run format`) to self-heal formatting and linting issues.
2. **Pre-commit Validation**: Before committing code or finalizing tasks, ensure all tests and linters pass by running:
   - `npm test`
   - `npm run format`
   - `npm run lint`
   - `npm run typecheck`
3. **Repository Intelligence**: We maintain continuously updated architecture diagrams and knowledge graphs in the `docs/architecture/` folder via the `npm run analyze:repo`, `npm run generate:diagrams`, and `npm run generate:knowledge-graph` scripts.
4. **Environment Constraints**:
   - `console.log` is prohibited by ESLint. Use `console.info`, `console.warn`, or `console.error` in scripts and code.
   - Automation scripts should output logs to files rather than stdout where requested, avoiding noise in CI.
   - For automated dependency execution, use `npx --yes` to avoid interactive prompts.
