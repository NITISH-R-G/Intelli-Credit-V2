# AI Agent Guidelines

This repository utilizes AI assistants to automate maintenance, code reviews, and architecture intelligence.

To ensure consistency and high quality, all AI agents must follow these guidelines:

1. **Task Automation**: Automate every repetitive task possible. Ensure scripts and actions take care of routine maintenance.
2. **Self-Healing**: Always run `npm run fix` before committing or reviewing to format and fix basic lint errors.
3. **Pre-commit Validation**: Always run pre-commit validations (`npm test`, `npm run format`, `npm run lint`) to ensure correctness.
4. **Strict Typing**: Do not use the `any` type in TypeScript. Provide proper strict types.
5. **No `console.log`**: Avoid using `console.log`, `console.warn`, `console.error`, etc., in automation scripts. Use `process.stdout.write` or `process.stderr.write` instead.

Failure to follow these rules will result in rejected modifications or PR reviews.
