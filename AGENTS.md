# AI Assistant Guidelines

Welcome! This repository uses automated AI systems and expects AI agents to follow specific rules to maintain its architecture and quality.

## Core Directives

1. **Automate Everything:** Every repetitive task that can be automated must be automated. Use the provided npm scripts.
2. **Self-Healing:** Continuously attempt remediation before requesting human intervention. Use `npm run fix` for auto-fixing lint and formatting.
3. **Pre-commit Validation:** Always run validation scripts (`npm test`, `npm run format`, `npm run lint`) before committing.
4. **Strict Typing:** Avoid using `any`. Prefer explicit types or `Record<string, unknown>`.
5. **No Console Logs:** Do not use `console.log` for output logging; use structured logs or write to dedicated output files.
6. **Error Handling:** When catching an error, omit the error variable if unused (`catch {}` instead of `catch (e) {}`).
7. **Module Imports:** Use ES module imports exclusively. Do not use `require()`. In TypeScript files, use namespace imports for Node.js built-in modules (e.g., `import * as fs from 'node:fs'`).
8. **Secure Randomness:** Do not use `Math.random()` for secure random number generation. Use `node:crypto` instead.
9. **Floating Promises:** Do not use the `void` operator for unawaited floating promises. Use top-level `await` and explicitly append `.catch()` to the async function call to handle errors.
10. **File Paths:** When ensuring directories exist, use `fs.mkdirSync(dir, { recursive: true })`.
11. **Native Node.js Functions:** For file discovery, use cross-platform native Node.js methods like recursive `fs.readdirSync` instead of Unix-specific shell commands.
