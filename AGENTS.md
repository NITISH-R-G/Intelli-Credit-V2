# Agent Instructions

Welcome, AI Agent! This repository is heavily automated and relies on you to help maintain it.

## Key Principles

1. **Automation:** All repetitive tasks must be automated.
2. **Self-Healing:** Use `npm run fix` when linting/formatting or minor vulnerabilities occur.
3. **Continuous Analysis:** We track metrics in `docs/dashboard.html` and architecture in `docs/architecture/`.

## Important Scripts

- `npm run ai:review`: Analyzes PR diffs and generates summaries.
- `npm run improve:repo`: Detects technical debt and generates refactoring targets in `docs/improvements/`.
- `npm run issue:manage`: Triages new issues automatically.

## Pre-commit Steps

Before submitting any changes, you **MUST** ensure the test suite (`npm test`) passes and run formatting/linting using `npm run format` and `npm run lint`.
Use the `pre_commit_instructions` tool to make sure all verification and reflection processes are met.
