# Guidelines for AI Assistants

1. **Automation of Repetitive Tasks**: AI agents must automate tasks such as issue triage, PR review, code analysis, and architectural diagram generation.
2. **Self-Healing Automation**: Use `npm run fix` to automatically correct formatting and linting issues when appropriate.
3. **Pre-commit Validation**: Before submitting changes, always ensure code stability by running the following validations:
   - `npm test` (Unit testing)
   - `npm run typecheck` (TypeScript validation)
   - `npm run format` (Code formatting)
   - `npm run lint` (Code quality analysis)
4. **General Assistance**: Continuously improve code quality and document architecture drift. Ensure every GitHub feature is utilized to keep the repository state synchronized with reality.
