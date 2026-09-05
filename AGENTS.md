# AI Agents Guidelines

This repository utilizes AI assistants to automate repository-wide tasks.

## General Guidelines

- Automate repetitive tasks whenever possible.
- Use `npm run fix` for self-healing, which includes auto-fixing linting issues and formatting code.
- Pre-commit validation must be performed using `npm test`, `npm run format`, and `npm run lint`.
- For AI PR review workflows, generate feedback into `pr-comment.txt` and post it using the `thollander/actions-comment-pull-request` action.
- Ensure that parent directories are created using `fs.mkdirSync(dir, { recursive: true })` before attempting to write outputs.
