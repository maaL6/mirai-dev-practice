# Test plan

## Purpose

The test strategy protects the core business flow while keeping feedback fast enough for six people
to integrate daily.

## Quality layers

| Layer | Owner | Runs | Focus |
|---|---|---|---|
| Backend unit | Feature owner | Local and CI | Domain rules, totals, transitions |
| Backend API | Feature owner | Local and CI | Validation, permissions, response contracts |
| Frontend component | Feature owner | Local and CI | Rendering, form behavior, accessibility |
| Integration | Paired module owners | CI | Cross-module transactions |
| End-to-end | TV6 with feature owner | CI/staging | Critical user journeys |
| Exploratory/UAT | Rotating reviewer | Weekly demo | Usability and unexpected workflows |

## Week 1 automated checks

- Backend lint with Ruff.
- Django system checks and missing-migration detection.
- API health test including a real database query.
- Frontend ESLint, TypeScript compilation, component test, and production build.
- Docker Compose configuration validation.

## Critical MVP journeys

1. Admin creates users and assigns each role.
2. Member creates a customer and contact, then finds them through search.
3. Member creates an opportunity, moves stages, and records an activity.
4. Opportunity owner creates and confirms a quotation with calculated totals.
5. Confirmation wins the opportunity and creates exactly one project.
6. Project manager assigns a task; assignee moves and comments on it.
7. Unauthorized member cannot read or mutate another team's restricted records.
8. Dashboard counts reflect committed records and task state changes.

## Test data personas

| Persona | Role | Team use |
|---|---|---|
| `admin@example.test` | Admin | Configuration and support |
| `manager@example.test` | Manager | Sales/project manager |
| `minh@example.test` | Member | Opportunity owner |
| `lan@example.test` | Member | Task assignee |
| `outsider@example.test` | Member | Negative permission tests |

Use `.test` addresses only. Seeded credentials are allowed in local and CI data, never production.

## Coverage and merge gates

- Backend package coverage starts at 80%; business services should exceed 90% branch coverage.
- No global frontend percentage gate during week 1; every interactive shared component must have a
  behavior test.
- A failed lint, type, migration, unit, or build check blocks merge.
- Flaky tests are treated as failures and fixed or quarantined with an owner and expiry date.

## Environments

- Local fast path: SQLite backend plus Vite frontend.
- Local integrated path: Docker Compose with PostgreSQL.
- CI: PostgreSQL service and clean dependency installs.
- Staging: production-like containers and seeded demonstration data.

## Weekly test rhythm

- During development: owner runs focused tests.
- Before PR: owner runs `scripts/check.ps1` or equivalent commands.
- Before weekly demo: TV6 runs the current end-to-end smoke suite on staging.
- Week 5: feature freeze, regression, permission matrix, responsive, and accessibility pass.
- Week 6: release candidate smoke test, backup/restore rehearsal, and UAT sign-off.

## Entry and exit criteria

A story may start when acceptance criteria, owner, API impact, and dependencies are clear. It is done
only when code, migration, permission checks, automated tests, documentation, and review are all
complete and the feature is demonstrable with seed data.
