# CRM specification

## Goal

Turn a potential sale into a qualified opportunity that can produce one or more quotations.

## Default stages

`New → Qualified → Proposal → Won` with `Lost` as an explicit closing action. Admin may reorder
stages, but won and lost semantics remain unique.

## MVP stories

1. A member creates an opportunity linked to a customer and optional contact.
2. An owner records expected revenue, expected close date, notes, and next activity.
3. An authorized user drags an opportunity to another open stage on a kanban board.
4. An owner marks an opportunity won or lost; lost requires a reason.
5. A user filters by owner, stage, status, customer, and overdue activity.
6. A user creates a draft quotation from an open opportunity.

## Rules

- Title, customer, stage, and owner are required.
- Expected revenue is zero or greater.
- Won and lost are terminal states; reopening requires Manager permission.
- A completed activity keeps its historical assignee and completion timestamp.
- Kanban positions are unique only within a stage and may be compacted after moves.

## Acceptance scenario

Given an open Acme opportunity assigned to Minh, when Minh moves it from Qualified to Proposal and
creates a quotation, the opportunity timeline records both actions. When a quotation is confirmed,
the opportunity becomes Won.

## Not in MVP

Email ingestion, campaign attribution, lead scoring, forecasting, duplicate merge, automation
rules, calendar synchronization, and recurring activities.
