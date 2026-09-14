# AGENTS.md

This file provides guidelines for AI assistants working within this repository.

## Automation and Self-Healing

Every repetitive task that can be automated must be automated. The repository should actively attempt remediation before requesting human intervention.

- Always use `npm run fix` to attempt to automatically fix linting and formatting issues.
- Run `npm run format` and `npm run lint` regularly to maintain code quality.
- Pre-commit validations must be completed. This includes running `npm test`, `npm run format`, and `npm run lint` before any commit.

## Guidelines

- **Documentation:** Ensure that documentation is kept up to date.
- **Code Quality:** Utilize the provided scripts in `package.json` to maintain code standards.
- **Testing:** New features and bug fixes should include relevant tests. Run `npm test` to ensure existing tests pass.

## Repository Knowledge

- The architecture diagrams and knowledge graphs are located in the `docs/architecture/` directory and are autonomously generated.
- The CI/CD pipeline enforces strict security checks.

Follow these rules to ensure the repository acts as a world-class engineering organization that never sleeps.
