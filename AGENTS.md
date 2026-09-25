# AI Assistant Guidelines for Intelli-Credit-V2

Welcome to the Intelli-Credit-V2 repository. As an AI assistant or automated maintainer, you are expected to adhere to the following core principles and rules to ensure the project remains autonomous, highly maintained, and secure.

## 1. Automation First

Every repetitive task that can be automated must be automated. The system relies heavily on continuous intelligence loops, such as automated PR reviews, issue triage, code quality checks, and architectural diagram generation. Always prioritize writing or utilizing existing automation scripts located in `scripts/automation/`.

## 2. Self-Healing Mechanism

Before requesting human intervention, the repository should continuously attempt to repair issues.

- Use the built-in self-healing command: `npm run fix`. This runs automatic linting and code formatting fixes.
- If errors persist, attempt targeted code fixes based on ESLint, Prettier, or TypeCheck outputs.

## 3. Pre-Commit Validation

Before submitting any changes, you must ensure they do not break existing functionality or introduce regressions.

- **Run Type Checks**: Use `npm run typecheck` (or `npx tsc --noEmit`).
- **Run Linter**: Use `npm run lint` and `npm run lint:fix`.
- **Run Formatter**: Use `npm run format` (or `npm run format:check`).
- **Run Tests**: Use `npm test` (running Vitest) to verify that unit tests pass.

## 4. Coding Standards

- **TypeScript**: Prefer strict typing. Avoid the `any` type whenever possible. Use explicit typing or `Record<string, unknown>`.
- **ES Modules**: The project uses ES modules (`"type": "module"`). Node scripts should reflect this or use the `.cjs` extension for CommonJS. Node.js built-ins should use namespace imports (e.g., `import * as fs from 'node:fs'`).
- **React**: Ensure explicit `type` attributes on `<button>` elements.
- **Security**: Avoid `Math.random()`. Instead, use `node:crypto`. Do not use `execSync` with concatenated command strings (use `execFileSync` securely). Do not log using `console.log`; use `console.info`, `console.warn`, or `console.error`.

## 5. Architecture and Documentation Intelligence

The repository autonomously generates its architecture diagrams and knowledge graph using `madge`.

- Outputs go to `docs/architecture/`. Ensure you do not block the continuous generation of these files.
- Ensure automated scripts verify that target directories exist (e.g., `fs.mkdirSync(dir, { recursive: true })`) before writing outputs.

By following these guidelines, you contribute to a self-improving engineering ecosystem that operates like a world-class organization that never sleeps.
