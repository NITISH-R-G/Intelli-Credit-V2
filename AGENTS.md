# AI Assistant Guidelines (AGENTS.md)

Welcome to the Intelli-Credit Terminal repository. If you are an AI assistant or automated agent working on this codebase, you must adhere strictly to the following guidelines.

## 1. Automation and Self-Healing

- **Enforce Automation**: Automate any repetitive task.
- **Self-Healing**: Use `npm run fix` for automated self-healing of the codebase whenever possible.
- **Pre-commit Validation**: You must run and pass `npm test`, `npm run format`, and `npm run lint` before committing any code changes.

## 2. GitHub Actions Security & Configuration

- **Command Injection Prevention**: In GitHub Actions workflows handling pull requests, variables like `github.base_ref` and `github.head_ref` MUST be assigned to environment variables and referenced (e.g., `$BASE_REF`) in run scripts, rather than directly injected using `${{ }}`.
- **Action Inputs**: When configuring the `thollander/actions-comment-pull-request@v3` GitHub Action, ensure inputs use **kebab-case** (e.g., `file-path`, `comment-tag`). Older camelCase or snake_case formats will cause CI failures.

## 3. Scripts and Execution Commands

The project uses `npm` for dependency management. Allowed execution commands:

- `npm run dev`: Start the local development server.
- `npm run build`: Build the project for production.
- `npm test`: Run tests via Vitest.
- `npm run lint`: Run ESLint and type-check.
- `npm run format`: Format code using Prettier.
- `npm run lint:fix`: Auto-fix ESLint issues.
- `npm run fix`: Run self-healing automation.
- `npm run ai:triage`, `npm run ai:improve`, `npm run ai:pr-review`: Run automated intelligence tasks via `tsx`.
- `npm run analyze:repo`, `npm run generate:diagrams`, `npm run generate:knowledge-graph`: Generate/maintain repository knowledge graph and architecture diagrams located in the `docs/` folder.

## 4. Scripting & Security Standards

- **Subprocess Security**: To pass Sourcery CI security checks, **DO NOT** use `execSync` with concatenated command strings in automation scripts. Use `execFileSync` with separated executable and argument arrays instead to prevent command injection.
- _Note:_ `execFileSync` does not invoke a shell and does not support pipes (`|`). Rewrite piped commands using native Node.js logic.
- **No `console.log`**: The project's ESLint configuration strictly prohibits `console.log`. Automation scripts and application code must use `console.info`, `console.warn`, or `console.error` instead.

## 5. Repository Intelligence

- The repository autonomously generates and maintains a repository knowledge graph and architecture diagrams.
- Do not manually edit files in `docs/architecture/` or auto-generated diagram files. Use the respective npm scripts (`analyze:repo`, `generate:diagrams`, `generate:knowledge-graph`) to regenerate them.

Adhere to these rules to maintain the world-class engineering standard of this self-improving repository.
