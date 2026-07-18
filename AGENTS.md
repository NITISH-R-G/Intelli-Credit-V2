# AI Agents Guidelines

This repository utilizes AI assistants to automate repetitive tasks and continuously improve the codebase. Please adhere to the following guidelines:

## Core Directives

- Every repetitive task that can be automated must be automated.
- Use `npm run fix` to trigger self-healing mechanisms for formatting and linting.
- Ensure all code modifications pass validation before committing. You must run:
  - `npm test`
  - `npm run format`
  - `npm run lint`

## Execution Environment

- Scripts in `scripts/automation/` will be run in GitHub Actions.
- Do not use `console.log`. Use `console.info`, `console.warn`, or `console.error`.
- Do not pipe standard output to write to files; instead, use `fs.writeFileSync` in scripts to create output files directly.
- Ensure directories are created using `fs.mkdirSync(dir, { recursive: true })` before attempting to write outputs to them.
- When working with `GEMINI_API_KEY`, ensure scripts exit gracefully with code `0` if the key is missing to prevent CI failures on forks.
- Prevent command injection by avoiding `execSync` with concatenated command strings. Use `execFileSync` instead.
