# ADR-0002: Use Django REST, React, and PostgreSQL

- Status: Accepted
- Date: 2026-07-27

## Context

The project should preserve Odoo's Python and PostgreSQL learning value while exposing the team to
a broadly applicable typed frontend stack.

## Decision

Use Django 5.2 and Django REST Framework for the backend, React with TypeScript and Vite for the
frontend, and PostgreSQL 17 for shared development and CI. Docker Compose defines the local system.

## Consequences

Django supplies migrations, authentication, admin tooling, and a mature ORM. React gives each
feature owner a full-stack slice. The team must maintain explicit API contracts between them.
