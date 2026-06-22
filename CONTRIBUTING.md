# Contributing to Intelli-Credit Terminal

First off, thank you for considering a contribution! This project is built and
maintained in the open, and every contribution — bug reports, docs, features,
tests — is welcome and valued.

By participating, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Table of contents

- [Quick start for contributors](#quick-start-for-contributors)
- [Project layout](#project-layout)
- [Development workflow](#development-workflow)
- [Coding standards](#coding-standards)
- [Commit message convention](#commit-message-convention)
- [Pull requests](#pull-requests)
- [Issue triage & labels](#issue-triage--labels)
- [Releases & versioning](#releases--versioning)
- [Good first issues](#good-first-issues)

---

## Quick start for contributors

```bash
# 1. Fork & clone (replace <your-user>)
git clone https://github.com/<your-user>/Intelli-Credit-V2.git
cd Intelli-Credit-V2

# 2. Install dependencies (Node >= 20)
npm ci

# 3. Configure your environment
cp .env.example .env
#   then edit .env and add your GEMINI_API_KEY from https://aistudio.google.com/apikey

# 4. Run the dev server (Vite SPA + local mirror of the API on :3000)
npm run dev
```

Open <http://localhost:3000>. Uploads hit the local `/api/analyze` route, which
runs the **same** `api/_lib/analyze-core.ts` core as production — so dev and
prod behavior are identical.

---

## Project layout

```
api/                  # Vercel serverless functions (server-side key lives here)
  analyze.ts          # POST /api/analyze — the only AI endpoint
  _lib/               # Shared core, tools, limits (imported by both prod + dev)
src/                  # Vite + React SPA (the client — never sees the API key)
  components/         # UI panels
  services/           # analysisService.ts: fetch adapter + pure risk math
  lib/                # gemini-config.ts (shared prompt/schema), utils, file-utils
server.ts             # Local-dev harness: serves SPA + mirrors /api/analyze
docs/                 # Architecture + project history
.github/              # Workflows, issue/PR templates, community health files
```

The defining architectural fact: **secrets never cross to the client.** See
[`docs/architecture/SERVICE_MAP.md`](docs/architecture/SERVICE_MAP.md).

---

## Development workflow

```bash
npm run typecheck   # tsc --noEmit (must pass before push)
npm run lint        # eslint .
npm run lint:fix    # eslint . --fix
npm run test        # vitest run (the full suite)
npm run test:watch  # vitest in watch mode while iterating
npm run build       # vite build (production client bundle)
npm run format      # prettier --write .
npm run format:check
```

CI runs `typecheck`, `lint`, `test`, and `build` on every pull request. **Note:**
the repository deliberately does **not** auto-format/auto-commit on push — keep
your branch clean and let CI report.

---

## Coding standards

- **TypeScript** everywhere; avoid `any` where a precise type is reasonable
  (existing `any` is mostly SDK-shaped response types — flag with a comment).
- **No secrets in client code.** Anything touching the Gemini key, eCourts key,
  or bureau credentials belongs in `api/_lib/*` or `server.ts`.
- **Keep the dev/prod parity.** Shared logic (limits, the analysis core, the
  MCP tools) lives in `api/_lib/` and is imported by both `api/analyze.ts` and
  `server.ts`. Don't fork it.
- **Tests for new behavior.** Unit-test pure logic (`src/services`,
  `api/_lib/`); the agentic loop is tested via mocks (see
  `api/_lib/__tests__/analyze-core.test.ts`).
- **Match the surrounding style** — Prettier + ESLint enforce the rest.

---

## Commit message convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`,
`security`, `perf`. Scope is optional but encouraged (`api`, `client`, `ci`,
`docs`).

```
feat(api): add per-call timeout to the Gemini loop
fix(client): correct DSCR display under interest shock
docs: rewrite README quickstart
```

Releases and changelog entries are generated from these commit types.

---

## Pull requests

1. Branch from `main` (e.g. `feat/stress-test-export`, `fix/dscr-rounding`).
2. Keep PRs focused — one logical change each. Split large work into a stack.
3. Add or update tests for any behavior change.
4. Update docs (`README.md`, `docs/`, doc comments) where relevant.
5. Ensure CI is green: `typecheck`, `lint`, `test`, `build`.
6. Open the PR against `main` and fill in the
   [PR template](.github/PULL_REQUEST_TEMPLATE/pull_request_template.md).

A maintainer will review. Reviews focus on correctness, security, test coverage,
and consistency — please treat feedback as collaborative.

---

## Issue triage & labels

New issues get `needs-triage` automatically. A maintainer will then apply the
appropriate label(s). Canonical set:

| Label | Meaning |
| --- | --- |
| `bug` | Something isn't working as documented |
| `enhancement` | A feature request or improvement |
| `documentation` | Docs gaps or inaccuracies |
| `good first issue` | Small, scoped, beginner-friendly — great first contribution |
| `help wanted` | Welcome community help; design is agreed |
| `needs-triage` | Awaiting maintainer review |
| `needs-design` | Needs discussion before work can start |
| `security` | Security-relevant (use [SECURITY.md](SECURITY.md) to report!) |
| `frontend` / `backend` | Affected area (auto-applied from changed paths) |
| `dependencies` / `github-actions` | Dependency or CI updates |
| `duplicate` / `wontfix` / `question` | Resolution states |

The path-based labels (`frontend`, `backend`, `documentation`, `dependencies`,
`github-actions`) are applied automatically by the **Pull Request Labeler**.

---

## Releases & versioning

- **Semantic Versioning** (`MAJOR.MINOR.PATCH`).
- A **release-drafter** workflow (`release.yml`) compiles draft release notes
  from Conventional Commits; a maintainer publishes the release.
- See [`CHANGELOG.md`](CHANGELOG.md) for the curated history.

---

## Good first issues

Look for issues labeled [`good first issue`](https://github.com/NITISH-R-G/Intelli-Credit-V2/labels/good%20first%20issue)
and [`help wanted`](https://github.com/NITISH-R-G/Intelli-Credit-V2/labels/help%20wanted).
Documentation improvements are especially welcome — they're a low-risk way to
learn the codebase.

Stuck? Open a draft PR or a Discussion and we'll help unblock you.

---

Thanks again for contributing. 💜
