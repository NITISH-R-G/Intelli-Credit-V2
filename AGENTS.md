# AI Assistant Guidelines

Welcome to the Intelli-Credit Terminal repository. This document outlines guidelines for AI assistants contributing to or managing this repository.

## Automation First

Every repetitive task that can be automated must be automated. You should actively look for opportunities to automate workflows, fix issues, and improve repository health.

## Self-Healing

The repository supports self-healing automation. AI assistants should proactively execute self-healing tasks.
Use the `npm run fix` command to automatically resolve linting, formatting, and other auto-fixable issues.

## Pre-commit Validation

Before proposing any changes (commits, pull requests, etc.), you **must** validate the state of the repository using the following commands:

- `npm run format`: Check and format code.
- `npm run lint`: Run ESLint and ensure there are no linting errors.
- `npm test`: Run the test suite and ensure all tests pass.

Ensure `npm audit` is checked and resolve issues using `npm audit fix` where applicable.

## Security and Conventions

- **Command Execution:** When executing commands in Node.js automation scripts, always use `execFileSync` from the `node:child_process` module instead of `execSync`. Avoid concatenated strings to prevent command injection. Do not use shell pipes (`|`) in `execFileSync`; implement the logic natively in Node.js.
- **Logging:** Do not use `console.log`. Use `console.info`, `console.warn`, or `console.error` instead.
- **Actions Variables:** In GitHub Actions workflows, properly reference environment variables (e.g., `$BASE_REF`) in run scripts rather than injecting them directly using `${{ }}` to prevent command injection vulnerabilities. Use kebab-case inputs for the `thollander/actions-comment-pull-request@v3` action (e.g., `file-path`, `comment-tag`).
- **Git Diffs:** When generating git diffs in GitHub Actions triggered by `pull_request` events, use `git diff origin/$BASE_REF...HEAD` instead of `$HEAD_REF`.
