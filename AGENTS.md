# Guidelines for AI Assistants and Automation

This repository relies heavily on autonomous scripts and automated intelligence tasks. When interacting with or modifying this codebase, AI agents MUST adhere to the following rules:

1.  **Automation of Repetitive Tasks:** Always prioritize the automation of repetitive, maintenance, and administrative tasks using GitHub Actions and local scripts.
2.  **Self-Healing:** Utilize the `npm run fix` command to automatically resolve formatting and linting issues.
3.  **Pre-Commit Validation:** Before committing code, ensure you have run the following validations:
    - `npm run format`
    - `npm run lint`
    - `npm test`
4.  **No Direct Pushes to Main:** Automation scripts must utilize Pull Requests for significant changes (e.g., using `peter-evans/create-pull-request`) rather than pushing directly to `main`.
5.  **Logging Practices:** Never use `console.log`. Use `console.info`, `console.warn`, or `console.error` instead.
6.  **Secure Execution:** Never execute untrusted scripts or build commands without proper verification. Always use `execFileSync` securely, passing arguments as an array instead of string concatenation to avoid command injection.
7.  **File Modifications:** Automation scripts that modify repository content must verify their work after creating or modifying files.
8.  **Graceful Fallbacks:** Scripts utilizing external APIs (like Google GenAI) must exit gracefully (code 0) if API keys are missing to ensure forks and untrusted PRs do not break CI.
