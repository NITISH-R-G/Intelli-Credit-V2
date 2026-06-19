# AI Assistant Guidelines

## Automation of Repetitive Tasks

Every repetitive task that can be automated must be automated. Seek opportunities to create scripts or workflows for any manual process.

## Self-Healing

Use `npm run fix` for self-healing and resolving common issues automatically.

## Pre-commit Validation

Before committing any changes, you MUST ensure that all pre-commit validation checks pass:

- Run tests: `npm test`
- Format code: `npm run format`
- Lint code: `npm run lint`

## Security

Do not use `execSync` with concatenated command strings in automation scripts to prevent command injection. Use `execFileSync` with separated executable and argument arrays instead.

## Code Quality

Do not use `console.log`. Automation scripts and application code must use `console.info`, `console.warn`, or `console.error` instead.
