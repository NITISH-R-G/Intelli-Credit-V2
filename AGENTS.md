# AI Guidelines (AGENTS.md)

Welcome, autonomous agents and AI assistants! When contributing to this repository, you must adhere strictly to the following engineering standards. This repository represents a self-healing, continuously improving ecosystem.

## 1. Automation and Self-Healing

- **Always try `npm run fix` first.** The project is configured with a self-healing loop. If your generated code causes linting or formatting issues, run `npm run fix` before attempting manual corrections.
- **Ensure verifiable outcomes.** Your code changes must pass the automated pre-commit checks (`npm test`, `npm run format:check`, `npm run lint`).

## 2. strict Typing

- **No `any`.** The use of the `any` type is strictly forbidden. You must use explicit types. If you do not know the type ahead of time, use `unknown` or `Record<string, unknown>`.
- **Awaiting Promises.** You must `await` all asynchronous operations. If a Promise intentionally goes unawaited, mark it with `void` (e.g., `void myFunction()`). However, do not use `void` on synchronous functions, as SonarCloud flags this.

## 3. Logging and Outputs

- **No `console.log`.** Never use `console.log`. Use `console.info`, `console.warn`, or `console.error` for standard logging.
- **File-based I/O for CI.** When running in automated environments, favor writing large outputs directly to files (e.g., `fs.writeFileSync`) rather than piping standard output through GitHub Actions environment variables, as this prevents workflow crashes and command injection.

## 4. Security Practices

- **No shell injection.** Avoid `execSync` with concatenated command strings. Always use `execFileSync` with arrays of arguments.
- **Randomness.** Do not use `Math.random()` for critical or ID-generation logic. Use secure alternatives like `node:crypto`.
- **Error Handling.** If you catch an error but do not use the error object, omit the variable entirely: `catch {}` instead of `catch (e) {}`.

## 5. Architectural Standards

- Use ES module syntax exclusively (no `require()`).
- Avoid default imports for Node.js built-ins. Prefer namespace imports: `import * as fs from 'node:fs'`.

Follow these rules unconditionally to maintain the autonomous, high-quality nature of this repository.
