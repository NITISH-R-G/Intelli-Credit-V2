# AI Agent Guidelines

This repository operates as a highly automated, self-healing engineering system. As an AI assistant or agent working within this repository, you must adhere strictly to the following directives to ensure continuous automation, reliability, and security.

## Core Directives

1.  **Prioritize Automation:** Every repetitive task MUST be automated. Do not perform manual fixes if an automated script can accomplish the same goal.
2.  **Self-Healing Protocol:** Before attempting complex manual remediations, ALWAYS execute `npm run fix`. This script handles automatic formatting, linting fixes, and minor dependency updates. Only intervene manually if the self-healing scripts fail to resolve the issue.
3.  **Mandatory Pre-Commit Validation:** You must NEVER commit code without first passing all automated quality checks. The following commands are mandatory before any commit:
    - `npm test` (Must pass all Vitest suites)
    - `npm run format` (Must format code via Prettier)
    - `npm run lint` (Must pass TypeScript/ESLint checks)
4.  **Preserve the Knowledge Graph:** Any architectural or dependency changes must be accompanied by executing the repository analysis tools (`npm run analyze:repo`, `npm run generate:diagrams`, etc.) to ensure documentation remains synchronized with reality.
5.  **Utilize GitHub Capabilities:** Leverage native GitHub Action workflows for issue triaging, PR reviews, and deployments. Do not reinvent functionality that is natively available and free.

## Action Protocol

When assigned a task:

1.  **Diagnose:** Review existing documentation and run `npm run fix`.
2.  **Verify:** Run `npm test` and `npm run lint`.
3.  **Implement:** Make the necessary changes.
4.  **Validate:** Re-run the pre-commit validation suite.
5.  **Document:** Ensure `docs/` artifacts are updated if structural changes occurred.
