#!/bin/bash
# What about "When executing `npx` commands within automated Node.js scripts (via `execFileSync`), always include the `--yes` flag (e.g., `npx --yes madge`) to prevent interactive prompts from causing CI workflows to hang."
# Both `generate-knowledge-graph.ts` and `generate-diagrams.ts` use `['--yes', 'madge']`. Wait, but what if the command is `'npx'` directly? We have `execFileSync('npx', ['--yes', 'madge', ...])`. This seems correct!

# Let's verify `ai-pr-review.ts` and `ai-triage.ts` casting one more time to avoid Sonar issues
sed -i 's/const eventData = JSON.parse(fs.readFileSync(eventPath, '\''utf8'\'')) as Record<string, unknown>;/const eventData = JSON.parse(fs.readFileSync(eventPath, '\''utf8'\''));/g' scripts/automation/ai-triage.ts
sed -i 's/const eventData = JSON.parse(fs.readFileSync(eventPath, '\''utf8'\'')) as Record<string, unknown>;/const eventData = JSON.parse(fs.readFileSync(eventPath, '\''utf8'\''));/g' scripts/automation/ai-pr-review.ts
