# ADR-0003: Use session authentication for the browser

- Status: Accepted
- Date: 2026-07-27

## Context

The MVP has one first-party browser client. Token storage and refresh flows would add risk without a
current mobile or third-party API requirement.

## Decision

Use Django session authentication with HTTP-only cookies and CSRF protection. Model authorization
with the Admin, Manager, and Member roles plus object-level rules.

## Consequences

Browser authentication remains simple and resistant to token theft from client-side storage.
Cross-origin development requires explicit CORS and CSRF origin configuration.
