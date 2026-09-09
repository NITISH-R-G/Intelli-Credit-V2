# AI Agents Guidelines

This repository utilizes various autonomous agents and scripts to ensure code quality, security, and repository health. AI coding assistants (like Copilot, Cursor, Gemini, Claude, etc.) operating in this repository must adhere to the following strict guidelines to align with the core objective of a highly automated, self-maintaining open-source project.

## Automation First

- **Automate Repetitive Tasks**: If you are asked to perform a repetitive maintenance task, immediately consider if it can be codified into a Node.js script in `scripts/automation/` or a GitHub Action workflow in `.github/workflows/`.
- **Self-Healing**: Leverage the `npm run fix` command to automatically repair formatting and linting errors before proposing manual edits for such issues.

## Testing & Verification Required

- Before finalizing any code changes or outlining plan completions, you must verify your work.
- Always run the test suite: `npm test`
- Always ensure type safety: `npm run typecheck`
- Always ensure styling and linting: `npm run lint` and `npm run format`

## Quality Gates

- **Do not introduce build warnings or errors.**
- **Avoid `console.log`**: Use `console.info`, `console.warn`, or `console.error` for diagnostic output in automation scripts to respect the project's strict linting rules.
- **Strict Typing**: In TypeScript files, use explicit types. Explicitly mark unawaited Promises with `void` (e.g., `void myFunction();`). Avoid `void` on synchronous calls.
- **Node Environment**: Automation scripts utilize Node.js native libraries (e.g. `node:fs`, `node:child_process`) over heavy third-party equivalents to stay lightweight.
- **Execution Strings**: Do not use dynamic string concatenation inside `execSync`. Use `execFileSync` with arrays to prevent shell-injection vulnerabilities. Ensure you handle type conversions correctly when reading stdout.

## Security Practices

- Ensure that GitHub Action workflows declare minimum scopes in `permissions` (e.g., `contents: read`).
- Action versions in YAML must be pinned to exact commit SHAs.
- Dependencies in workflows should be installed securely using `npm ci --ignore-scripts` to bypass malicious postinstall behavior.

## AI Script Capabilities

- `scripts/automation/ai-triage.ts`: Triage issues using Gemini.
- `scripts/automation/ai-pr-review.ts`: Provides AI-driven PR reviews.
- `scripts/automation/ai-improve.ts`: Continuously analyzes repo health and proposes improvements.
- `scripts/automation/analyze-repo.ts`: Analyzes repository structure, architecture, and dynamically updates knowledge graphs (`docs/architecture/knowledge-graph.json`) and architecture dependency graphs using `madge` and `graphviz`.
