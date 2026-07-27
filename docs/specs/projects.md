# Projects specification

## Goal

Plan and track the work needed to deliver a confirmed sale.

## Project states

`Planned → Active → Completed`, with `Cancelled` available to Managers.

## Task states

`Todo → In progress → Review → Done` displayed as a kanban board.

## MVP stories

1. Confirmation of a quotation creates a project linked to its customer and quotation.
2. A manager can also create an internal project without a quotation.
3. A member creates tasks with title, assignee, due date, and description.
4. An authorized user moves tasks between states and reorders a column.
5. Project members discuss work through plain-text task comments.
6. Users filter their tasks and see overdue work.

## Rules

- Project name, status, and manager are required.
- Task title, project, and status are required; assignee is optional.
- A project cannot complete while it has unfinished tasks unless a Manager confirms the override.
- Only project members, Managers, and Admins can view project tasks.
- Comments are append-only in the MVP; Admin may remove abusive content.
- Completing a task stores completion time and completing user.

## Acceptance scenario

Given a project created from a confirmed Acme quotation, when its manager assigns a due task to Lan,
Lan sees it in My Tasks, moves it to Review, and adds a comment. The dashboard reflects the new task
state and no longer counts it as Todo.

## Not in MVP

Gantt scheduling, timesheets, billing, dependencies, recurring tasks, attachments, external portal,
real-time chat, and notifications.
