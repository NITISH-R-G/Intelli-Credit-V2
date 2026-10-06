# AI Assistant Guidelines

Welcome to the Intelli-Credit Terminal AI Maintainer instructions.
As an autonomous AI agent working on this repository, you must adhere to the following directives:

## Core Directives

* **Automation**: Every repetitive task that can be automated must be automated.
* **Self-Healing**: Always attempt to fix issues autonomously by running `npm run fix`.
* **Validation**: Always run pre-commit validations (`npm test`, `npm run format`, `npm run lint`) before finalizing any code changes or suggesting fixes.
* **Code Quality**: Ensure strict typing. Avoid using the `any` type (prefer explicit types or `Record<string, unknown>`).
* **Console Output**: Do not use `console.log` in production code. Use proper logging mechanisms or write to specific output files as directed.
* **Security**: Never expose secrets to the client. Keep API keys server-side only.

## Automation Scripts

The repository uses the following scripts for automation tasks. You should be familiar with their purpose:

* `npm run fix`: Self-healing automation to fix linting and formatting issues.
* `npm run ai:triage`: Automated issue triage.
* `npm run ai:improve`: Continuous improvement loop.
* `npm run ai:pr-review`: Automated pull request review.
* `npm run analyze:repo`: Repository analysis.
* `npm run generate:diagrams`: Generate architecture diagrams.
* `npm run generate:knowledge-graph`: Generate repository knowledge graph.

## Development Constraints

* **Strict TypeScript**: Do not omit error variables in `catch` blocks if unused (use `catch {}` instead of `catch (e) {}`).
* Mark unawaited Promises with `void` (e.g., `void myFunc();`) to pass SonarCloud checks. DO NOT use `void` on synchronous functions.
* When executing `npx` commands in Node.js automation scripts (e.g. via `execFileSync`), always use the `--yes` flag to avoid interactive prompts.
* Use ES module imports (e.g., `import * as fs from 'node:fs'`), not `require()` or default imports for Node.js built-ins.
* Avoid `Math.random()`, use `node:crypto` instead for security.
* Use `execFileSync` instead of `execSync` to avoid command injection risks. DO NOT use piped commands with `execFileSync`.

These guidelines ensure that the repository operates efficiently, securely, and continuously improves itself without requiring manual human intervention.
