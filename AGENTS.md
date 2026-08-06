# AI Agent Guidelines

This repository relies heavily on AI automation and self-maintaining systems to ensure high quality, performance, and contributor experience.
When AI agents or automated scripts interact with this codebase, they must adhere to the following directives:

## 1. Automation First

- Every repetitive task that can be automated must be automated.
- Run `npm run fix` (which runs `npm run lint:fix && npm run format`) to automatically self-heal formatting and linting issues.
- AI assistants should rely on the automated scripts located in `scripts/automation/` for tasks such as PR reviews (`npm run ai:pr-review`), issue triage (`npm run ai:triage`), continuous improvement (`npm run ai:improve`), and architecture intelligence (`npm run generate:diagrams`, `npm run generate:knowledge-graph`).

## 2. Pre-Commit Verification

- Before any changes are committed, they must pass validation.
- Use `npm test` to run tests and ensure no regressions are introduced.
- Use `npm run format` and `npm run lint` to enforce consistent code style and identify code smells.
- Use `npm run typecheck` to verify TypeScript types.

## 3. Strict Coding Conventions

- `console.log` is strictly prohibited. AI scripts and application code must use `console.info`, `console.warn`, or `console.error` instead.
- TypeScript code must explicitly mark unawaited Promises with `void` (e.g., `void myAsyncFunc();`) to pass strict ESLint and SonarCloud rules. Do not use `void` on synchronous functions.
- Avoid using `execSync` with concatenated command strings. Use `execFileSync` with separated executable and argument arrays to prevent command injection.
- When executing `npx` commands within automated Node.js scripts via `execFileSync`, always include the `--yes` flag (e.g., `npx --yes madge`) to prevent interactive prompts from hanging CI workflows.
- React `<button>` elements must possess an explicit `type` attribute (e.g., `type="button"`).

## 4. Documentation and Architecture

- Architecture diagrams and a knowledge graph are automatically generated and maintained in `docs/architecture/` using the `npm run generate:diagrams` and `npm run generate:knowledge-graph` scripts.
- AI automation scripts must ensure parent directories like `docs/history/` and `docs/architecture/` exist before attempting to write outputs using `fs.mkdirSync(dir, { recursive: true })`.

## 5. Security & Safe Execution

- When working with GitHub Actions and dynamic event data (like issue titles or bodies), read the event payload directly from `process.env.GITHUB_EVENT_PATH` using `fs.readFileSync` and `JSON.parse` rather than injecting variables into the environment.
- AI scripts must exit gracefully with code `0` when `GEMINI_API_KEY` is missing to avoid blocking external contributors from submitting PRs.
- To avoid logging noise in GitHub Action outputs, AI scripts must write their final comment or output directly to dedicated files (e.g., `triage-comment.txt`, `pr-comment.txt`) utilizing `fs.writeFileSync`.
