# Agent Guidelines

Welcome to the Intelli-Credit AI Maintainer guidelines. These instructions are meant for AI assistants or autonomous bots that work in this repository.

## Core Directives

1.  **Automation & Self-Healing First**:
    Always attempt to use the repository's autonomous self-healing scripts. If there are formatting or linting issues, run `npm run fix` before attempting manual corrections.
2.  **Pre-Commit Validation**:
    Before finalizing any changes or creating a pull request, you **must** run the following pre-commit validation checks and ensure they pass:
    - `npm run typecheck`
    - `npm run lint`
    - `npm test`
    - `npm run format:check`
3.  **Strict Typing & Code Quality**:
    - Avoid using the `any` type. Prefer explicit typing or `Record<string, unknown>`.
    - Mark unawaited Promises explicitly with the `void` operator (e.g., `void myAsyncFunction();`).
    - Omit the error variable in catch blocks if unused (i.e., `catch {}`).
    - Use `console.info`, `console.warn`, or `console.error` instead of `console.log`.
    - Use namespace imports for Node.js built-ins (e.g., `import * as fs from 'node:fs'`).
4.  **Security**:
    - Avoid using `execSync` with concatenated command strings. Use `execFileSync` with arrays of arguments to prevent command injection.
    - Avoid using `Math.random()` for random number generation; prefer `node:crypto`.
    - GitHub Actions workflow versions must be pinned to exact SHAs, not tags.
    - Handle files securely, and when dealing with `process.env.GITHUB_EVENT_PATH`, read the JSON directly via `fs.readFileSync` rather than injecting environment variables.
5.  **Repository Intelligence Scripts**:
    This repository orchestrates autonomous tasks via scripts in the `scripts/automation/` folder:
    - `ai-triage.ts`: Triages new issues automatically.
    - `ai-pr-review.ts`: Reviews pull requests automatically.
    - `ai-improve.ts`: Performs a continuous improvement loop, generating issue recommendations.
    - `analyze-repo.ts`: Analyzes repository structure.
    - `generate-diagrams.ts` & `generate-knowledge-graph.ts`: Run `madge` to maintain architecture graphs in `docs/architecture/`.
    - `self-healing.ts`: Runs `npm run fix` autonomously.
      These tools should be used for maintaining a world-class, automated open-source environment.
