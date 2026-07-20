# AI Assistant Guidelines

## Scope
This file contains rules and guidelines for any AI assistant operating within this repository.

## Core Directives
1. **Automation:** Every repetitive task that can be automated must be automated. Use provided scripts under `scripts/automation/`.
2. **Self-Healing:** Ensure code self-heals by running `npm run fix`. When resolving format/lint issues, utilize the `fix` tool or native scripts.
3. **Pre-Commit Validation:** Ensure all pre-commit validation steps run prior to submitting. The following scripts must pass without error:
    - `npm test`
    - `npm run format:check` or `npm run format`
    - `npm run lint` or `npm run lint:fix`
    - `npm run typecheck`
4. **Environment Context:** Do not output logs using `console.log`. Only use `console.info`, `console.warn`, or `console.error`.
5. **No Pipe Operations in execFileSync:** Avoid command injection. Use `execFileSync(cmd, [args])` without pipes in all automation scripts.
6. **Graceful Failures:** If `GEMINI_API_KEY` is not present, all scripts interacting with AI models should exit gracefully with `0` to avoid failing CI/CD pipelines in forks.
7. **Directory Assurance:** When scripts output to directories like `docs/history/` or `docs/architecture/`, you must guarantee these exist via `fs.mkdirSync(dir, { recursive: true })` prior to writing.
