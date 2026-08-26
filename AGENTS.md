# AI Agents Guidelines

This document contains guidelines for AI assistants interacting with this repository.

## Automation

- Every repetitive task that can be automated must be automated.
- Autonomous scripts are located in `scripts/automation/`.

## Self-Healing

- Always use `npm run fix` for self-healing, which runs `npm run format`, `npm run lint:fix`, and `npm audit fix`.
- Use this script as the first step to fix any code quality, formatting, or dependency vulnerabilities.

## Validation and Pre-commit

- Before committing any changes, you must validate your work by running:
  - `npm test`
  - `npm run format`
  - `npm run lint`

## General Rules

- The repository must function continuously with minimal human intervention.
- Use native Node.js methods like recursive `fs.readdirSync` rather than relying on Unix-specific shell commands (e.g., `find`) in automation scripts.
- Use explicit casting `(execFileSync(...) as unknown as Buffer).toString()` when using `execFileSync` in TypeScript without specifying an encoding string.
- Explicitly mark unawaited Promises with `void` (e.g., `void triage();`) in TypeScript code. Do not use `void` on synchronous functions.
- Automation scripts and application code must use `console.info`, `console.warn`, or `console.error` instead of `console.log`.
- In TypeScript files, use namespace imports for Node.js built-in modules (e.g., `import * as fs from 'node:fs'`).
