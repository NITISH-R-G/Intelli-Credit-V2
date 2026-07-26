# AI Agent Guidelines

Welcome to the Intelli-Credit Terminal repository. AI assistants working on this repository must adhere to the following rules:

1. **Automation Over Manual Work**: Every repetitive task that can be automated must be automated.
2. **Self-Healing**: Always use `npm run fix` (which runs `npm run format` and `npm run lint:fix`) before submitting changes.
3. **Pre-Commit Validation**: Before submitting any PR, you MUST ensure that `npm test`, `npm run format`, and `npm run lint` all run successfully.
4. **Environment**: We use Node.js 20+ and the Google GenAI SDK.
5. **Security**: Ensure dependencies are kept secure (`npm audit fix`).

## AI Scripts
AI scripts for self-healing and continuous improvement are located in `scripts/automation/`. They must:
- Write large outputs directly to files rather than `console.log` (e.g. `fs.writeFileSync`).
- Ensure parent directories like `docs/history/` and `docs/architecture/` exist using `fs.mkdirSync(dir, { recursive: true })` before attempting to write outputs.
- Never use `.bash` or standard `execSync` with piped commands without considering command injection. Use `execFileSync` properly.
- Include `--yes` when using `npx` (e.g. `npx --yes madge`) inside `execFileSync`.
- Exit gracefully with code `0` if `GEMINI_API_KEY` is not present, to prevent failing for external forks.
