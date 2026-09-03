# Guidelines for AI Assistants and Agents

This file contains instructions for AI assistants interacting with this repository.

## Core Directives

1. **Automation First:** Automate any repetitive task. Use tools and scripts effectively.
2. **Self-Healing:** Always attempt to use `npm run fix` (which runs `npm run lint:fix` and `npm run format`) before seeking human intervention for styling or syntax issues.
3. **Pre-commit Validation:** Always validate changes locally before committing.
   - Run `npm test` to ensure tests pass.
   - Run `npm run format` for formatting check.
   - Run `npm run lint` for linting.
4. **Code Structure:**
   - In TypeScript files, use namespace imports for Node.js built-in modules (e.g., `import * as fs from 'node:fs'`) instead of default imports.
   - React `<button>` elements must possess an explicit `type` attribute (e.g., `type="button"`).
5. **Automation Scripts:**
   - For file discovery in Node.js automation scripts, use cross-platform native Node.js methods like recursive `fs.readdirSync`.
   - When using `execFileSync` in TypeScript without specifying an encoding string, explicitly cast the result using `(execFileSync(...) as unknown as Buffer).toString()`. If using `encoding: 'utf-8'`, explicitly cast to `string` as `execFileSync(...) as string`.
   - Always include the `--yes` flag when executing `npx` commands (e.g., `npx --yes madge`).
   - When handling large multi-line text outputs like git diffs in GitHub Actions, save the output to a file and read it directly via Node.js `fs.readFileSync` in automation scripts.
   - Avoid using `execSync` with concatenated command strings. Use `execFileSync` with separated executable and argument arrays instead.
   - TypeScript code must explicitly mark unawaited Promises with `void` (e.g., `void triage();`). Do not use `void` on synchronous functions.
6. **AI Tools:**
   - Automation scripts must perform actual API calls utilizing the `@google/genai` SDK using `gemini-2.0-flash`.
   - AI scripts must exit gracefully with code `0` when `GEMINI_API_KEY` is missing.
