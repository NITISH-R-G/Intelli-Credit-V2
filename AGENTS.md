# AI Agents Guidelines

This document provides guidelines for AI assistants working within this repository.

## Automation
- Every repetitive task that can be automated must be automated.
- Automate repetitive tasks using scripts in `scripts/automation/`.

## Self-Healing
- Use `npm run fix` to attempt automated self-healing for linting and formatting issues.

## Pre-Commit Validation
- Before any code commit, the following validations MUST be executed and pass:
  - `npm test` (Run unit and integration tests)
  - `npm run format` (Format codebase)
  - `npm run lint` (Lint codebase)

## Coding Standards
- Do not use `console.log`. Use `console.info`, `console.warn`, or `console.error`.
- Avoid `any` types in TypeScript. Use explicit types or `Record<string, unknown>`.
- Empty catch blocks should not define an error variable if unused: `catch {}`.
- Synchronous functions should not return `void`. However, unawaited Promises should be explicitly marked with `void`.
- Use native Node.js cross-platform methods rather than shell commands where possible (e.g. `fs.readdirSync` instead of `find`).
- Use namespace imports for Node built-ins: `import * as fs from 'node:fs'`.
