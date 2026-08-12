# Guidelines for AI Assistants & Automations

This repository enforces strict automation, self-healing, and pre-commit validation. AI agents modifying this repository must follow these rules:

## 1. Automation and Self-Healing

- **Self-Healing:** If you encounter linting or formatting issues, always attempt to fix them autonomously by running `npm run fix`.
- **Continuous Improvement:** The repository uses automated intelligence scripts (`npm run ai:triage`, `npm run ai:improve`, `npm run ai:pr-review`) to continuously monitor and improve the codebase. Ensure these scripts are prioritized and run as intended.
- **Documentation:** Architecture diagrams and knowledge graphs are autonomously maintained via `npm run generate:diagrams` and `npm run generate:knowledge-graph`. Always update documentation automatically when the codebase changes.

## 2. Pre-commit Validation

Before submitting any changes, you **must** run the following checks and ensure they pass:

1.  **Tests:** `npm test`
2.  **Type Checking:** `npm run typecheck`
3.  **Formatting:** `npm run format`
4.  **Linting:** `npm run lint`

## 3. GitHub Actions & CI

- All automated workflows must use specific commit SHAs for actions (e.g., `uses: actions/checkout@11d5960...`) instead of version tags to pass SonarCloud security checks.
- When using `execFileSync` in TypeScript automation scripts, do not use concatenated command strings to prevent command injection, and explicitly cast the result to `string`.
- Ensure that file paths and event payloads are read securely (e.g., using `fs.readFileSync(process.env.GITHUB_EVENT_PATH)`) rather than injecting them via environment variables.

## 4. Dependencies

- Use `node-version: 20` for all GitHub Action workflows.
- In `pull_request` workflows, use `npm ci --ignore-scripts` to install dependencies safely.
