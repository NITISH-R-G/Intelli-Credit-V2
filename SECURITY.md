# Security Policy

## Supported Versions

Only the current major version receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Report them privately using GitHub's built-in **Private Vulnerability Reporting**:

👉 **[Report a vulnerability](https://github.com/NITISH-R-G/Intelli-Credit-V2/security/advisories/new)**

This keeps the report encrypted and visible only to repository maintainers until
a fix is coordinated and published. If Private Vulnerability Reporting is
unavailable, open a draft Security Advisory from the
[Security tab](https://github.com/NITISH-R-G/Intelli-Credit-V2/security/advisories).

## Response SLA

- We will acknowledge receipt of your report within **48 hours**.
- You can expect regular progress updates at least every 7 days until resolved.
- If you don't hear back within 48 hours, please follow up by adding a comment
  to your advisory.

## Scope

This policy covers the production application in this repository, including the
Vercel serverless function (`api/`), the Vite client (`src/`), and the local
development server (`server.ts`). It does **not** cover third-party dependencies
— report those to the upstream maintainer, and optionally file a Dependabot
alert here.

## Known security posture

- The Google Gemini API key and the eCourts key are **server-side only** and
  never ship in the client bundle.
- The `/api/analyze` endpoint supports an optional shared-secret gate
  (`ANALYZE_SECRET` env var → `x-analyze-secret` header) and per-instance rate
  limiting as an abuse backstop.
- See [`CONTRIBUTING.md`](CONTRIBUTING.md) and
  [`docs/architecture/SERVICE_MAP.md`](docs/architecture/SERVICE_MAP.md) for the
  architecture.

## Recognition

We appreciate responsible disclosure and will credit reporters in the published
Security Advisory (and the release notes) unless you prefer to remain anonymous.
