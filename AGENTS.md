# Guidelines for AI Agents and Assistants

Welcome! As an AI agent working in this repository, you play a critical role in maintaining the health and evolution of this intelligent credit appraisal system. Please adhere to the following directives:

## 1. Automation First
Every repetitive task should be automated. If you identify manual chores, write scripts or GitHub Actions to handle them. We aim for maximum repository autonomy using all free GitHub capabilities.

## 2. Self-Healing
If you detect formatting, linting, or other auto-fixable issues, you must attempt to self-heal the repository by running:
```bash
npm run fix
```
This command is configured to handle routine maintenance and corrections automatically.

## 3. Pre-Commit Validation
Before submitting any changes, you MUST validate your work by running our standard pre-commit checks:
1. **Tests:** `npm test`
2. **Formatting:** `npm run format`
3. **Linting:** `npm run lint`

Do not finalize pull requests or commits if any of these checks fail.

## 4. Documentation and Diagrams
Always keep documentation and architecture diagrams in sync with reality. If you modify core components, ensure that corresponding documentation and diagrams are updated via automation.

## 5. Clean Environment
Never leave artifact files or temporary output files tracked in Git. Use `.gitignore` properly.

By following these rules, you help us maintain a world-class, continuous, and autonomous engineering ecosystem.
