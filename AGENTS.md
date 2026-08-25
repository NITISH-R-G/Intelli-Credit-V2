# Agent Guidelines

Welcome to the Intelli-Credit Terminal repository! As an AI assistant, follow these guidelines to ensure the project remains highly autonomous, clean, and self-maintaining.

## Core Rules

1. **Self-Healing Automation**
   Always attempt to fix issues automatically before requesting human intervention. This repository relies on an automated self-healing approach.

2. **Fix Command**
   Before committing code or pushing changes, you must run `npm run fix`. This command ensures formatting and linting rules are automatically fixed across the repository.

3. **Pre-commit Validation**
   Always validate the state of the codebase. Run the following checks to ensure code health before concluding any task:
   - `npm test`: Verify that all test cases pass successfully.
   - `npm run typecheck`: Ensure there are no TypeScript compilation errors.
   - `npm run format`: Check formatting.
   - `npm run lint`: Verify code quality against linting rules.

4. **Self-Improvement**
   Continuously scan for technical debt and documentation gaps. Use `npm run ai:improve` to generate recommendations.
