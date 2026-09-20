# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Repository transformed for open-source readiness: MIT License added, README
  rewritten, CONTRIBUTING/SECURITY expanded, structured issue templates and PR
  template, deterministic CI/release automation.

### Removed

- All AI-dependent and autonomous-commit automation (AI doc agent, self-healing
  auto-fix, self-updating README, autonomous repo analysis, dashboard
  generator) and their generated artifacts (`metadata.json`,
  `docs/dashboard.html`, `docs/architecture/dependency-graph.md`). The repo is
  now maintainable without any LLM API keys or recurring token consumption.

## [1.0.0] — 2026-06-23

### Security

- Moved the Google Gemini API key fully server-side into Vercel serverless
  functions (`/api/analyze`). The key is never bundled, never logged, and never
  returned to the client. The `@google/genai` SDK is absent from the client
  bundle (~277 KB / 54 KB gz removed).
- Added security headers to `vercel.json` (CSP, `X-Frame-Options: DENY`, HSTS,
  `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy).
- Hardened `/api/analyze`: file-type allowlist, 20-file count cap, early
  `Content-Length` rejection, sanitized error responses (generic message +
  opaque `requestId`; full detail logged server-side only), optional
  shared-secret gate (`ANALYZE_SECRET`), and per-instance rate limiting.
- Added per-call timeout (30s) + bounded retry with exponential backoff for
  transient (429/5xx) Gemini errors.
- Restricted dev-server CORS from `*` to a localhost + optional origin allowlist.

### Added

- `api/analyze.ts`, `api/_lib/analyze-core.ts`, `api/_lib/mcp-tools.ts`,
  `api/_lib/limits.ts` — the serverless analysis layer and shared limits.
- Tests for upload limits and analysis-core resilience (timeout, retry,
  guard paths).

### Changed

- `performAnalysis` now POSTs to `/api/analyze` and runs the pure client-side
  `calculateRiskAndFraud` on the result; structured server error codes map to
  precise UI messages.
- `vite.config.ts` no longer inlines the key via `define`; removed the `genai`
  manual chunk.
- CI runs `typecheck`, `lint`, `test`, and `build` (was `tsc` + `test` + `build`).

### Removed

- Dead dependencies: `pdf-parse`, `@types/pdf-parse`,
  `@types/express-rate-limit`, duplicate `vite` entry.
- Dead files: `test-pdf.ts`, `test-pdf2.ts`, duplicate `src/lib/file-utils.test.ts`.
