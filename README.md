# Mirai Mini ERP

## What is ready

- Django REST backend with a custom user foundation and seven bounded modules.
- React and TypeScript frontend with a responsive application shell and design tokens.
- PostgreSQL development database through Docker Compose.
- Backend and frontend health integration.
- Automated lint, test, migration, and build checks in GitHub Actions.
- Architecture decisions, ERD, business specifications, wireframes, and test plan.

## Quick start with Docker

1. Copy `.env.example` to `.env`.
2. Run `docker compose up --build`.
3. Open the frontend at <http://localhost:5173>.
4. Check the API at <http://localhost:8010/api/health/>.

Docker persists PostgreSQL data in a named volume. The backend and frontend source directories are
mounted for development reloads.

## Run without Docker

Backend, using SQLite for a zero-setup local database:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements-dev.txt
Set-Location backend
python manage.py migrate
python manage.py runserver
```

Frontend, in another terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

## Validate everything

On Windows:

```powershell
./scripts/check.ps1
```

The same checks run on every pull request. See [development workflow](docs/development.md) for
branching, review, and definition-of-done rules.

## Documentation map

- [Architecture](docs/architecture.md)
- [Entity relationship diagram](docs/erd.md)
- [API conventions](docs/api-conventions.md)
- [Contacts specification](docs/specs/contacts.md)
- [CRM specification](docs/specs/crm.md)
- [Sales specification](docs/specs/sales.md)
- [Projects specification](docs/specs/projects.md)
- [Wireframes](docs/wireframes.md)
- [Design system](docs/design-system.md)
- [Test plan](docs/test-plan.md)
- [Development workflow](docs/development.md)
- [Week 2 work plan](docs/week-02-work-plan.md)

## Current scope

The MVP includes identity and roles, contacts, CRM, product catalog, quotations, projects, tasks,
comments, and basic reporting. Accounting, inventory, payroll, multi-company, email gateways,
e-commerce, and a generic plugin engine are deliberately out of scope.
