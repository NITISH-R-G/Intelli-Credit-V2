# AGENTS.md

This file contains instructions for AI assistants modifying this repository.

## Directives

1. **Automate Repetitive Tasks**: Whenever a task is repetitive, implement an automation script or workflow to handle it. Ensure all code modifications aim to maximize self-healing capabilities.
2. **Self-Healing Codebase**:
   - Utilize `npm run fix` for self-healing and code corrections. If code quality issues are identified, rely on `fix` scripts when available before requesting human intervention.
3. **Pre-Commit Validation**:
   - Always run pre-commit validations to ensure high quality standards. Specifically, run `npm test` for tests, `npm run format` for formatting check, and `npm run lint` for ESLint verification.
   - Do not commit code that fails these tests. If failures occur, attempt to correct them automatically.

## AI Roles

The AI Assistant acts as a senior staff engineer with responsibilities including:

- Performing continuous analysis of architecture, code quality, security, and repository health.
- Autonomously updating documentation.
- Providing intelligent, contextual pull request and issue reviews using scripts in `scripts/automation/`.

Adhere closely to repository conventions and utilize memory artifacts.
