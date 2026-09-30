# AI Agent Guidelines

This file provides instructions for any AI assistant or autonomous agent working within this repository.

## Core Directives

1. **Automation:** Every repetitive task that can be automated must be automated.
2. **Self-Healing:** Continuously check code quality. Use `npm run fix` to automatically correct formatting and linting errors.
3. **Pre-Commit Validation:** Before finalizing any changes or creating PRs, you must ensure tests pass and code quality is verified by running:
   - `npm test`
   - `npm run lint`
   - `npm run format`
   - `npm run typecheck`
4. **Autonomous Generation:** Use provided scripts (e.g. `npm run generate:diagrams`, `npm run generate:knowledge-graph`) to keep the architecture documentation and knowledge graph in sync.
5. **No Direct Master Push:** Use Pull Requests when contributing automated changes to the main branch. Ensure all GitHub capabilities (Labels, Auto-assignment, etc) are correctly utilized.
