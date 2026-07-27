# API conventions

## Resource shape

- Base path: `/api/`
- JSON property names: `snake_case`
- Resource identifiers: UUID strings
- Dates: `YYYY-MM-DD`
- Datetimes: ISO 8601 with timezone
- Money: decimal strings, for example `"1250.00"`

List resources return:

```json
{
  "count": 42,
  "next": "/api/opportunities/?page=2",
  "previous": null,
  "results": []
}
```

Validation errors return field-keyed messages. Business conflicts use HTTP 409 and include a stable
error code suitable for frontend handling.

```json
{
  "code": "quotation_already_confirmed",
  "detail": "Only draft quotations can be confirmed."
}
```

## HTTP behavior

- `GET` reads resources and must not mutate state.
- `POST` creates resources or invokes an explicit transition action.
- `PATCH` performs partial updates.
- `DELETE` is reserved for disposable drafts; referenced master data is deactivated.
- Workflow transitions use action endpoints such as `POST /api/quotations/{id}/confirm/`.

All write endpoints require authentication, CSRF protection, server-side permission checks, and
transactional validation. Health is intentionally public.
