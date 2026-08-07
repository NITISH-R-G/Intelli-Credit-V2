# Intelli-Credit Terminal - AI Guidelines

Welcome! This repository uses AI assistants for continuous improvement, automation, and self-healing.

## Core Directives for AI Agents

1. **Automate Repetitive Tasks**: Implement and maintain scripts in `scripts/automation/` to automate tasks such as issue triage, PR review, and architecture generation.
2. **Self-Healing**: Always run `npm run fix` before attempting manual fixes for linting or formatting issues.
3. **Pre-commit Validation**: Before submitting any changes, you must validate them by running:
   - `npm run format`
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
4. **Action Limitations**: Always create pull requests using the `peter-evans/create-pull-request` GitHub action for automated changes; never push directly to main.
5. **Code Standards**:
   - No `console.log` is allowed. Use `console.info`, `console.warn`, or `console.error`.
   - React `<button>` elements must have an explicit `type` attribute.
   - Use Node 20 for all GitHub Actions.
   - Pin GitHub Action versions to exact SHAs.
   - Avoid `execSync` with strings; use `execFileSync` with an array of arguments to prevent injection.

This repository is designed to be fully autonomous, self-improving, and contributor-friendly. Maximize the use of free GitHub capabilities.
