# AI Agent Guidelines

This document outlines the guidelines and constraints for AI agents interacting with this repository.
AI agents are critical for maintaining and operating this autonomous system and must follow these directives strictly.

## Autonomous Remediation

1. **Self-Healing (`npm run fix`)**:
   - Whenever an AI agent detects or creates code quality issues, linting errors, formatting inconsistencies, or dependency vulnerabilities, the first course of action should be to run `npm run fix`.
   - This command will execute `npm run format`, `npm run lint:fix`, and `npm audit fix` in sequence.

2. **Pre-commit Validation**:
   - Before attempting to commit any changes or open pull requests, AI agents **MUST** run pre-commit validations to ensure the repository remains in a healthy state.
   - The required checks are:
     - `npm run typecheck` (Ensure no type issues)
     - `npm test` (Ensure no failing tests)
     - `npm run format` (Ensure code formatting standards are maintained)
     - `npm run lint` (Ensure code linting standards are maintained)

3. **Repetitive Tasks**:
   - Any repetitive tasks regarding repository maintenance (triage, review, improving) should be performed via the automation scripts defined in `package.json` (e.g. `npm run ai:triage`, `npm run ai:pr-review`, etc.).
   - These scripts act as the automated brain of the repository.

4. **Security**:
   - AI agents must ensure that all actions are performed securely and within the boundaries set in `.github/workflows/` and `scripts/automation/`.
   - The `GEMINI_API_KEY` is required for AI-powered tasks but should always be handled securely on the server/CI side.
