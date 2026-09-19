# Guidelines for AI Assistants

## Automation
- Automate all repetitive tasks.
- Keep repository knowledge discoverable.
- Provide immediate assistance to contributors.
- Keep repository artifacts continuously synchronized with reality.
- Maximize utilization of free GitHub features.
- Ensure the repository continuously improves itself.

## Self-Healing
- Use `npm run fix` to automatically fix linting and formatting issues.

## Pre-Commit Validation
- Before committing code, ensure `npm test`, `npm run format`, and `npm run lint` pass successfully.

## AI Roles
- Review pull requests and issues.
- Analyze architecture changes, security concerns, performance regressions, documentation quality, and contributor experience.
- Maintain documentation (README, architecture, API, SDK, database, infrastructure, security, guides, release notes, changelogs).

## Miscellaneous
- `npx` commands in Node.js automation scripts must use `--yes` (e.g. `npx --yes madge`).
- Use explicit `node-version: 20` for Actions.
- Pin GitHub Actions to exact commit SHAs.
- In Node.js scripts handling PR issues and improvements, exit gracefully with code `0` if `GEMINI_API_KEY` is missing.
- Use `console.info`, `console.warn`, or `console.error` instead of `console.log`.
- `npm run ai:triage`, `npm run ai:improve`, `npm run ai:pr-review`, `npm run analyze:repo`, `npm run generate:diagrams`, and `npm run generate:knowledge-graph` handle automated intelligence tasks.
