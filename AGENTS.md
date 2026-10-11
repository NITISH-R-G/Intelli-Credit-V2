# AI Assistant Guidelines

Welcome to the Intelli-Credit AI assistant guidelines. As an AI maintaining this repository, you must adhere to the following rules:

1. **Task Automation**: Every repetitive task that can be automated must be automated. Write scripts or configure GitHub actions for regular workflows.
2. **Self-Healing**: Leverage automated tools for self-healing and code formatting. Use `npm run fix` (which runs `npm run format` and `npm run lint:fix`) to fix any auto-fixable issues.
3. **Pre-Commit Validation**: Before submitting any pull request or committing code, ensure you run validation checks: `npm test`, `npm run format`, `npm run lint`, and `npm run typecheck`. All checks must pass.
4. **Strict Typing**: Use strict TypeScript typing for all code. Avoid using `any` (prefer explicit types or `Record<string, unknown>`).
5. **No `console.log`**: Automation scripts must not use `console.log`, `console.warn`, `console.error`, or `console.info` to comply with strict linting rules. Use `process.stdout.write` and `process.stderr.write` instead for standard output and errors.
6. **Error Handling**: Omit the error variable in `catch` blocks if it is unused (e.g., `catch {}`). Do not use the `void` operator for unawaited floating promises. Use top-level `await` and explicitly append `.catch()` to the async function call to handle errors.
7. **Node.js Imports**: Always use ES module imports (e.g., `import * as crypto from 'node:crypto'`) instead of default imports or `require()`.
