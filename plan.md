1. **Create `AGENTS.md`**: Add guidelines for AI assistants, enforcing the automation of repetitive tasks, use of `npm run fix` for self-healing, and pre-commit validation using `npm test`, `npm run format`, and `npm run lint`.
2. **Update `package.json`**: Add the required automation scripts (`fix`, `ai:triage`, `ai:improve`, `ai:pr-review`, `analyze:repo`, `generate:diagrams`, `generate:knowledge-graph`) pointing to `tsx scripts/automation/...`.
3. **Implement Automation Scripts in `scripts/automation/`**:
   - `self-heal.ts`: Executes `lint:fix`, `format`, etc., using `execFileSync` to prevent command injection and without `console.log`.
   - `ai-triage.ts`: Mocks/Implements issue triaging using `@google/genai`.
   - `ai-improve.ts`: Mocks/Implements continuous improvement loop.
   - `ai-pr-review.ts`: Reads git diff safely (`origin/$BASE_REF...HEAD`), generates a PR review, and saves it to a file.
   - `analyze-repo.ts`: Analyzes repo and outputs to `docs/`.
   - `generate-diagrams.ts`: Generates architecture diagrams to `docs/`.
   - `generate-knowledge-graph.ts`: Generates knowledge graph to `docs/`.
4. **Create GitHub Actions Workflows**:
   - `ai-pr-reviewer.yml`: Runs on PRs, assigns `github.base_ref` to `$BASE_REF`, runs `npm run ai:pr-review`, and posts the output using `thollander/actions-comment-pull-request@v3` with kebab-case inputs.
   - `ai-issue-triager.yml`: Runs `npm run ai:triage` on issue creation.
   - `continuous-improvement.yml`: Runs `npm run ai:improve` on a schedule.
   - `autonomous-docs.yml`: Runs doc generation scripts on push to main and opens a PR or commits directly.
5. **Pre-commit and Verify**: Run all verification steps and pre-commit instructions.
6. **Submit**: Submit the changes.
