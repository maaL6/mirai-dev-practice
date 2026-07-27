# ADR-0001: Use a modular monolith

- Status: Accepted
- Date: 2026-07-27

## Context

Six contributors need to learn module design and complete an integrated ERP slice in six weeks.
Independent services would add deployment, networking, observability, and data-consistency work.

## Decision

Use one Django application and one PostgreSQL database. Organize business capabilities as Django
apps with documented dependency direction and clear ownership.

## Consequences

Transactions and local development stay simple. Contributors can work by module. The codebase must
enforce boundaries through review because the runtime does not isolate modules.
