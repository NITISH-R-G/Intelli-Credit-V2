# AI Agents and Automation Guidelines

This repository relies heavily on autonomous agents and self-healing automation to maintain code quality, security, architecture documentation, and issue/PR management.

## Guidelines for AI Assistants

When operating in this repository, you must adhere to the following principles:

1. **Automation Over Manual Effort**: Every repetitive task should be automated. Use the provided tools and scripts before attempting manual interventions.
2. **Self-Healing Automation (`npm run fix`)**: Before and after making changes, run `npm run fix`. This script automatically fixes formatting and linting issues. Do not ignore errors raised by these tools.
3. **Pre-Commit Validation**: Before submitting any PR, ensure the following commands run successfully:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run format:check`
   - `npm test`
4. **Architectural Intelligence**: The project continuously maintains its architectural documentation. Ensure you understand the current state by looking at the artifacts in `docs/architecture/` (e.g., `dependency-graph.svg`, `knowledge-graph.json`) which are generated via `npm run analyze:repo`, `npm run generate:diagrams`, and `npm run generate:knowledge-graph`.
5. **Code Quality & CI Pipeline**: Do not bypass the CI/CD pipeline checks. SonarCloud, linting rules, and strict TypeScript rules apply. Do not leave explicit `console.log` statements; use `console.info`, `console.warn`, or `console.error`.
6. **No Ignored Types or Muted Errors**: Avoid suppressing type-checking errors (`@ts-ignore`) or linting rules (`// eslint-disable-next-line`) unless absolutely necessary and documented with a clear reason.

These instructions should be automatically incorporated into the context of AI bots acting upon this repo.
