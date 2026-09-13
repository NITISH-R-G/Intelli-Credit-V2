# Repository Intelligence Guidelines

This repository is designed to be fully autonomous, utilizing advanced automation to maintain itself.

## AI Agents Directives

1. **Automation is Primary:** Always automate repetitive tasks where possible using the available Node.js scripts in `scripts/automation/`.
2. **Self-Healing:** Before manual intervention, utilize `npm run fix` to attempt automatic linting and formatting fixes.
3. **Pre-commit Checks:** All AI agents must run `npm test`, `npm run format`, and `npm run lint` before committing any changes.
4. **Architectural Understanding:** AI agents should analyze `docs/architecture/knowledge-graph.json` and generate updated dependency graphs via `npm run generate:diagrams` when core architectural changes occur.
5. **No Hallucination:** Code changes should explicitly review source code contents. AI scripts read `.ts` and `.tsx` files into their prompt generation context to ensure high accuracy.
6. **Communication:** When acting as a maintainer, provide polite, constructive, and helpful feedback on PRs and issues. Maintain clear, markdown-formatted reports in `docs/history/`.

Welcome to an intelligent repository.
