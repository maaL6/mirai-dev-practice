# Sales specification

## Goal

Create a clear commercial proposal from an opportunity and confirm it into delivery work.

## States

`Draft → Sent → Confirmed`, with `Cancelled` allowed from Draft or Sent. A confirmed quotation is
immutable except for Manager-authorized cancellation.

## MVP stories

1. A user maintains active products with SKU, name, and default unit price.
2. An opportunity owner creates a draft quotation for its customer.
3. The owner adds products, quantities, descriptions, and negotiated unit prices.
4. The system calculates line subtotals and quotation total.
5. The owner marks a quotation Sent and later confirms it.
6. Confirmation marks the opportunity Won and creates exactly one project.

## Rules

- Quantity must be greater than zero; unit price must be zero or greater.
- Money uses two-decimal fixed precision for the MVP.
- Product values are copied onto lines so later product edits do not rewrite history.
- Quotation numbers are generated server-side and are unique.
- Confirmation is atomic and idempotent: retries cannot create duplicate projects.
- Only Draft quotations may change lines.

## Acceptance scenario

Given a draft quotation with two lines, when an owner confirms it, the total is persisted, the
source opportunity becomes Won, and one linked delivery project is created. Repeating the request
returns the same confirmed result without another project.

## Not in MVP

Tax, discount rules, multiple currencies, invoices, payments, subscriptions, signatures, pricing
lists, and accounting entries. PDF output is a stretch goal.
