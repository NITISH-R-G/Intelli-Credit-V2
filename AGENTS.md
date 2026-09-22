# AI Agents Guidelines

This repository is designed to be an advanced, autonomous, self-improving, contributor-friendly, and educational open-source repository. It maximizes the use of free GitHub capabilities.

The repository functions as a world-class engineering organization that never sleeps. It operates continuously with minimal human intervention.

## Core Directives for AI Assistants

- **Automate Everything:** Every repetitive task that can be automated must be automated.
- **Self-Healing System:** Continuously attempt remediation before requesting human intervention. Use `npm run fix` to automatically fix formatting and linting issues.
- **Pre-commit Validation:** Ensure pre-commit validation using `npm test`, `npm run format`, and `npm run lint`.
- **Autonomous Documentation:** Keep documentation continuously synchronized with reality.
- **Continuous Improvement:** Proactively analyze the repository for weaknesses, technical debt, and missing documentation.

## Automation and Self-Healing Tools

- `npm run fix`: Run this to fix linting and formatting issues autonomously.
- **Pre-commit validations:**
  - `npm test`: Runs Vitest tests.
  - `npm run format:check`: Validates formatting.
  - `npm run lint`: Runs ESLint.
  - `npm run typecheck`: Runs TypeScript type checking.

## Node.js & TypeScript Rules

- Use explicit types, avoiding the `any` type (prefer `Record<string, unknown>`).
- Omit the error variable in `catch` blocks if it is unused (`catch {}`).
- Use namespace imports for Node.js built-ins (`import * as fs from 'node:fs'`).
- In Node.js automation scripts, use `fs.readdirSync` for file discovery instead of Unix commands.
- Explicitly mark unawaited Promises with `void` (e.g., `void myFunction();`). Do not use `void` on synchronous functions.
- When using `execFileSync` with `encoding: 'utf-8'`, explicitly cast the result to `string`. If no encoding, cast to `(execFileSync(...) as unknown as Buffer).toString()`.
- Do not use `console.log`. Use `console.info`, `console.warn`, or `console.error` instead.
- Avoid `Math.random()`. Use secure alternatives like `node:crypto` (`crypto.randomBytes(1)[0] / 255`).

## GitHub Actions & Automation Guidelines

- AI automation scripts must ensure parent directories exist (`fs.mkdirSync(dir, { recursive: true })`) before writing outputs.
- Scripts writing files for PR comments/issues must write to dedicated files (e.g., `triage-comment.txt`, `pr-comment.txt`) rather than standard output.
- Read PR diffs via `fs.readFileSync` from files created by `curl`, not via shell variable substitution.
- Pin all GitHub Actions to exact commit SHAs.
- Avoid `execSync` with concatenated command strings. Use `execFileSync` with arrays.
- Scripts using `@google/genai` should exit with code `0` gracefully if `GEMINI_API_KEY` is missing to support open-source forks.
- In TS scripts using Gemini, use `response.text` as a getter property, not a method (`response.text()`).
