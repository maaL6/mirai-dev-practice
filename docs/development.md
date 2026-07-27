# Development workflow

## Initial setup

Use Docker Compose for the shared integration environment. A local SQLite database is supported for
fast backend feedback but is not a substitute for PostgreSQL validation.

Create `.env` from `.env.example`; do not commit it. Verify the project with:

```powershell
./scripts/check.ps1
docker compose config --quiet
```

## Branches and commits

- `main` must stay releasable.
- Feature branches use `feature/<module>-<short-name>`.
- Fix branches use `fix/<module>-<short-name>`.
- Keep a branch under three working days; split large work vertically.
- Commits describe the user-visible or architectural result in imperative mood.

## Pull requests

- Open a draft PR early for contract or migration visibility.
- Keep one primary concern per PR.
- Call out database migrations, permission changes, and cross-module imports.
- Require one reviewer outside the owning module.
- Use adjacent review pairs: TV1↔TV4, TV2↔TV5, TV3↔TV6; rotate weekly.
- Rebase or merge the latest `main` before final approval according to repository policy.

## Definition of done

- Acceptance criteria pass.
- API and UI operate together where applicable.
- Server-side permissions are tested.
- Migrations are deterministic and `makemigrations --check` is clean.
- New behavior has automated tests.
- CI passes and no temporary debug code remains.
- Relevant docs and seed data are updated.
- The feature is shown in the weekly demo.

## Team ownership

| Member | Primary module | Cross-cutting duty |
|---|---|---|
| TV1 | Identity/platform | Architecture and deployment |
| TV2 | Contacts | Seed data and data quality |
| TV3 | CRM | Workflow consistency |
| TV4 | Catalog/Sales | Money and document correctness |
| TV5 | Projects | Collaboration behavior |
| TV6 | Reporting/shared UI | QA automation and accessibility |

Ownership means first response and design responsibility, not exclusive editing rights.

## API and database changes

- Discuss cross-module model relationships before coding.
- Add indexes only for a documented query or constraint.
- Never rewrite a migration already applied to shared staging; add a new one.
- Treat API responses as contracts. Breaking changes require coordinated frontend updates in the
  same release.

## Security review prompts

Every business endpoint review asks:

1. Who may call it?
2. Which records may they see or mutate?
3. Can input choose an owner, price, status, or related record they do not control?
4. Is the state transition valid and transactional?
5. Does the response expose another user's or customer's data?
