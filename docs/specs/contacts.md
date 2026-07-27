# Contacts specification

## Goal

Provide one trusted record for each customer organization or individual and the people associated
with it. Contacts supply customer data to CRM, Sales, and Projects.

## Roles

- Admin: create, update, deactivate, and reassign any customer.
- Manager: manage customers owned by their team.
- Member: view customers connected to records assigned to them; create customers they own.

## MVP stories

1. A member creates a company or individual customer with name and at least one contact method.
2. A member adds zero or more people to a company.
3. A user searches by customer name, contact name, email, or phone.
4. A user sees related opportunities, quotations, and projects on a customer detail page.
5. An authorized user deactivates a duplicate or obsolete customer without breaking history.

## Rules

- Customer name is required.
- Kind is `company` or `individual`.
- Company contacts require a customer; an individual may use its own primary contact fields.
- Email is normalized to lowercase and phone numbers are trimmed.
- Referenced customers cannot be physically deleted.

## Acceptance scenario

Given a member owns Acme Ltd, when they add Linh Nguyen as a contact and search for `linh`, the
customer appears. When Acme later has an opportunity and project, both are visible on its detail
page to authorized users.

## Not in MVP

Address validation, duplicate merging, external enrichment, multiple legal addresses, and customer
portal access.
