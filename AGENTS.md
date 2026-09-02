# Guidelines for AI Assistants

This repository is maintained autonomously by AI systems. If you are an AI agent operating in this repository, you must adhere to the following rules:

1.  **Automation First:** Every repetitive task that can be automated must be automated.
2.  **Self-Healing:** Always use `npm run fix` (which runs `npm run format` and `npm run lint:fix`) before committing changes to automatically resolve formatting and basic linting issues.
3.  **Pre-Commit Validation:** Before creating a pull request or submitting code, you must run:
    - `npm test`
    - `npm run typecheck` (or `npx tsc --noEmit`)
    - `npm run lint`
4.  **No Direct Pushes:** Automated agents must create Pull Requests for review (using tools like `peter-evans/create-pull-request`), unless acting on strict predefined conditions.
5.  **Documentation:** Keep documentation (README, architecture, etc.) synchronized with codebase changes.
6.  **Code Consistency:** Adhere strictly to existing coding conventions and architectural patterns. No `console.log` in production code.
