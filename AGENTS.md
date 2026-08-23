# AI Agents Guidelines

This repository utilizes AI assistants to automate repetitive tasks, maintain documentation, perform self-healing, and provide intelligent reviews. All AI automation scripts and assistants must adhere to the following guidelines:

## Core Principles

- **Automate Repetitive Tasks**: Any task that can be scripted or automated should be. Use the provided tools and scripts to generate documentation, analyze architecture, and triage issues.
- **Self-Healing**: Leverage automated fixes where possible. Run `npm run fix` (which executes both formatting and linting fixes) to resolve minor code quality issues automatically.
- **Pre-Commit Validations**: Before committing code, you **must** ensure all automated checks pass. This includes:
  - Running unit tests: `npm test`
  - Verifying formatting: `npm run format:check` or applying format via `npm run format`
  - Verifying linting rules: `npm run lint` or fixing via `npm run lint:fix`
  - Verifying types: `npm run typecheck`

## Additional Instructions

- All AI scripts should exit gracefully without failing CI pipelines if the necessary secrets (like `GEMINI_API_KEY`) are missing, particularly to support external open-source contributions.
- Utilize the `@google/genai` SDK with the `gemini-2.0-flash` model for intelligent repository tasks.
- Respect linting configurations, notably refraining from using `console.log`; use `console.info`, `console.warn`, or `console.error` instead.
