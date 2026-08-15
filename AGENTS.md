# 🤖 Intelli-Credit AI Agent Guidelines

This repository is maintained and improved by autonomous AI agents. If you are an AI assistant interacting with this repository, please adhere to the following rules to maintain the integrity of our autonomous workflows:

## Core Directives

1. **Automation First:** Every repetitive task that can be automated must be automated.
2. **Self-Healing:** Always run `npm run fix` after modifying code to automatically fix linting and formatting issues.
3. **No Mocks:** When writing automation scripts (e.g., in `scripts/automation/`), use the actual `@google/genai` SDK and do not use mocked placeholders.
4. **Validation:** Never commit or submit without first validating the code. Run `npm test`, `npm run format`, and `npm run lint` before opening PRs.
5. **Contextual Awareness:** In scripts like `ai-triage.ts` or `ai-improve.ts`, directly read `.ts` and `.tsx` file content to give context and prevent hallucination.
6. **Graceful Failures:** Ensure all automated scripts gracefully exit with a 0 code if `GEMINI_API_KEY` is not present to prevent CI failures from external forks.

## React Specifics

- **Button Elements:** All React `<button>` elements must possess an explicit `type` attribute (e.g., `type="button"`) to satisfy SonarCloud and linting rules.

## Node.js Automation Scripts

- **Cross-Platform:** Use native Node.js methods like recursive `fs.readdirSync` for file discovery instead of Unix commands (`find`, `grep`).
- **Child Processes:** Use `execFileSync` instead of `execSync` to prevent command injection.
- **No Console Logs:** Do not use `console.log`. Use `console.info`, `console.warn`, or `console.error` instead.
- **Typing:** Explicitly cast `execFileSync` return values to strings when necessary, and mark unawaited Promises with `void`.
- **NPX:** When using `npx` in scripts, always use the `--yes` flag.
