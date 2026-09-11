# Agent Guidelines

## General Code Conventions

- Use `npm run fix` to self-heal linting/formatting errors.
- Run `npm test`, `npm run format:check`, and `npm run lint` before committing.
- Do not use `console.log`. Use `console.info`, `console.warn`, or `console.error`.
- Ensure React `<button>` elements possess an explicit `type` attribute (e.g., `type="button"`).
- In TypeScript files, use namespace imports for Node.js built-in modules (e.g., `import * as fs from 'node:fs'`).
- Always mark unawaited Promises with `void` (e.g., `void triage();`), but never use `void` on synchronous functions.
- The repository is ES modules based (`"type": "module"`). Use `.cjs` for CommonJS temporary scripts.

## Automation & Scripts

- Output final comments/results from scripts to dedicated files (e.g., `triage-comment.txt`, `pr-comment.txt`, `docs/history/ai-improvement-report.md`) using `fs.writeFileSync`.
- Avoid command injection vulnerabilities: don't use `execSync` with concatenated command strings. Use `execFileSync` with executable and arguments arrays.
- Always include the `--yes` flag with `npx` commands (e.g., `npx --yes madge`).
- Use `fs.mkdirSync(dir, { recursive: true })` before writing outputs.
- Initialize the Google GenAI client using `new GoogleGenAI({ apiKey })` instead of mocked placeholders.
- If `GEMINI_API_KEY` is missing in scripts, exit gracefully with code `0`.
- Use cross-platform native Node.js methods like recursive `fs.readdirSync` for file discovery.
- Use `execFileSync(...) as string` (when `encoding: 'utf-8'` is set) or `(execFileSync(...) as unknown as Buffer).toString()` when calling `execFileSync` in TS.

## GitHub Actions

- Use `node-version: 20` for actions/setup-node.
- Define minimum job permissions (e.g., `permissions: contents: read` + specific write permissions).
- Fetch PR diffs directly using curl with `Accept: application/vnd.github.v3.diff` and `Authorization: Bearer ${{ secrets.GITHUB_TOKEN }}` rather than git diff. Use `>` in YAML for long curl commands.
- Save large text outputs like git diffs to a file and read via `fs.readFileSync` in Node, rather than using shell env vars with command substitution.
- Pin actions to exact commit SHAs (e.g., `uses: actions/checkout@11d5960...`).
- Run `npm ci --ignore-scripts` for dependencies in PR workflows.
- For AI PR reviewer, use `pull_request_target` event and checkout base branch.
- Use `process.env.GITHUB_EVENT_PATH` with `fs.readFileSync` instead of injecting `${{ github.event... }}` directly into environment vars for strings to prevent injection.
- Don't install GH Actions like `peter-evans/create-pull-request` as local npm deps; use via YAML.
- Use kebab-case inputs for `thollander/actions-comment-pull-request` (e.g., `file-path`, `comment-tag`). Use file presence checks (e.g., `if: hashFiles('triage-comment.txt') != ''`) to conditionally run the comment step.

## External tools

- Architecture diagrams require `madge`, requiring `graphviz` in CI (`sudo apt-get install -y graphviz`).
- AI scripts use `@google/genai` (requiring `@modelcontextprotocol/sdk` as devDependency for types) with the `gemini-2.0-flash` model.
