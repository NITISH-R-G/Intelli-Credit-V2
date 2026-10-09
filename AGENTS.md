# AI Agent Guidelines

Welcome, AI Agent. This repository expects you to act autonomously, fixing issues directly instead of just leaving comments. Follow these rules implicitly.

## Core Rules

1. **Self-Healing Automation First:** If you see an issue (linting error, formatting, bug), fix it. Use `npm run fix` before attempting manual changes.
2. **Pre-commit Validation:** Always run the following before committing:
   - `npm test`
   - `npm run format`
   - `npm run lint`
   - `npm run typecheck`
3. **Strict Typing:** No `any` types. Use explicit types or `Record<string, unknown>`.
4. **No Console Logs in Production or Scripts:** Avoid `console.log`, `console.warn`, etc. Use `process.stdout.write` or proper logging frameworks.
5. **No Void Promises:** Do not use `void` for unawaited floating promises. Use top-level `await` or append `.catch()`.
6. **ES Modules Only:** Avoid `require()`. Use ES modules everywhere (e.g., `import * as fs from 'node:fs'`).
7. **No Shell Vulnerabilities:** When using `execFileSync`, avoid running user-provided input without extreme validation. Avoid shell interpolation.
8. **GitHub Workflows:** Use specific commit SHAs for actions (e.g., `actions/checkout@11d5960...`) instead of tags.
9. **No Direct Push to Main:** Always use pull requests for changes.
10. **Architecture Intelligence:** Keep diagrams up to date via `npm run generate:diagrams`.
11. **Security First:** Never expose secrets. Be vigilant when interacting with the API or execution environments.

Follow these rules, and you'll do great.
