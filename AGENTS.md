# AI Agent Guidelines

This document provides instructions for AI assistants or agents operating within this repository.
The objective of this repository is to operate as an autonomous, self-improving open-source project.

## Core Rules

1.  **Automate Repetitive Tasks**: Whenever encountering a repetitive task, prefer scripting or setting up automation rather than doing it manually.
2.  **Self-Healing**:
    *   Use `npm run fix` to automatically resolve formatting and linting issues.
    *   Run tests regularly to verify changes (`npm test`).
    *   Pre-commit validation is required. Before making changes, you must validate them using:
        *   `npm test`
        *   `npm run format`
        *   `npm run lint`
3.  **Strict Typing**: Do not use the `any` type in TypeScript. Use explicit types or `Record<string, unknown>`.
4.  **No Console.log**: Use `console.info`, `console.warn`, or `console.error` instead of `console.log`.
5.  **Environment Stability**: Prefer diagnosing and fixing root causes before attempting to modify environment dependencies.

By following these instructions, you help maintain the high quality and autonomous nature of this project.
