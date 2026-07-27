# Design system foundation

## Principles

1. **Business calm:** dense enough for daily work, never visually noisy.
2. **Clear consequence:** primary, secondary, and destructive actions are visually distinct.
3. **Reusable patterns:** list, form, kanban, detail, dialog, and feedback primitives are shared.
4. **Accessible by default:** keyboard navigation and visible focus are release requirements.

## Tokens

The executable token source is `frontend/src/styles/tokens.css`.

| Token | Value | Purpose |
|---|---:|---|
| Ink | `#17211b` | Primary text |
| Muted ink | `#5f6e64` | Supporting text |
| Surface | `#f4f1e9` | App background |
| Panel | `#fffdf8` | Cards and forms |
| Accent | `#1f6b4f` | Primary action and success |
| Danger | `#a54035` | Destructive actions and errors |
| Sidebar | `#17241d` | Global navigation |

Spacing follows a 4 px base scale. Corners use 8, 14, or 24 px equivalents. Page layouts should
prefer borders and spacing over heavy shadows.

## Typography

- Interface: Inter with system UI fallbacks.
- Display: Georgia for high-level marketing or onboarding statements only.
- Body minimum: 14 px on dense desktop tables, 16 px for prose and mobile forms.
- Avoid all-caps except short labels with increased letter spacing.

## Component inventory

Week 2 begins with these shared components:

- Button: primary, secondary, quiet, destructive, icon-only.
- Input: text, number, date, textarea, select, async relation picker.
- Feedback: alert, toast, inline error, status badge, skeleton.
- Data: table, pagination, filter bar, empty state.
- Overlay: dialog and confirmation dialog.
- Navigation: sidebar, breadcrumbs, tabs.
- Workflow: kanban board, column, and card.

Feature-specific cards may compose primitives but must not redefine their colors, focus behavior, or
spacing.

## Accessibility baseline

- Target WCAG 2.2 AA for contrast and interaction.
- Every interactive element is keyboard reachable.
- Focus is visible and never removed without a replacement.
- Icon-only controls have accessible names.
- Status is not communicated by color alone.
- Form errors are programmatically associated with fields.
- Drag-and-drop workflows provide a keyboard or menu alternative.
- Motion respects `prefers-reduced-motion` when animation is introduced.

## Responsive behavior

- `≥ 1200 px`: full sidebar and multi-column boards.
- `900–1199 px`: compact content while retaining sidebar.
- `< 900 px`: top module navigation; boards scroll horizontally.
- `< 680 px`: single-column forms and stacked page actions.
