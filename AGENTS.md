# AI Agent Guidelines

This repository relies on AI agents to maintain, improve, and extend the system autonomously.

## Core Directives

1. Task Automation: Automate repetitive tasks via scripts (e.g., `npm run fix` for self-healing).
2. Validation: Always ensure Prettier formatting, ESLint rules, and Vitest test suites pass before submitting PRs (`npm test`, `npm run format`, `npm run lint`).
3. Typing: Use strict TypeScript typing without the `any` keyword.
4. Logging: Do not use `console.log`.
