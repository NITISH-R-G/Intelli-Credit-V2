# AI Assistant Guidelines

Welcome to the autonomous repository! This file provides critical context and strict rules for AI assistants (and human contributors acting in automated capacities) working within this codebase.

## Core Directives

1. **Automation First**: Every repetitive task must be automated.
2. **Self-Healing**: Leverage automated tools (like `npm run fix`) to resolve code quality and formatting issues autonomously.
3. **Validation**: All changes must pass strict pre-commit validation. Always run `npm test`, `npm run format`, and `npm run lint` before committing.
4. **Knowledge Discovery**: Ensure the repository knowledge graph (generated via `madge`) is kept up-to-date for architecture understanding.
5. **Autonomy**: Scripts should avoid human intervention unless absolutely necessary.

## Scripts & Operations

- `npm run fix`: Automatically repairs linting and formatting violations. Run this constantly.
- `npm run analyze:repo`, `npm run generate:diagrams`, `npm run generate:knowledge-graph`: Use these to rebuild the project's internal understanding.
- `npm run ai:triage`, `npm run ai:improve`, `npm run ai:pr-review`: AI-powered intelligence scripts for repository governance.
