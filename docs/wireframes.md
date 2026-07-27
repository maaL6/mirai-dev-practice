# MVP wireframes

These low-fidelity wireframes define information hierarchy and core interaction patterns. They are
not final visual designs; feature owners should reuse the documented layout and design tokens.

## Application shell

```text
┌───────────────────┬──────────────────────────────────────────────────────────┐
│ MIRAI MINI ERP    │ Page title                         Search   + Create     │
│                   ├──────────────────────────────────────────────────────────┤
│ Overview          │ Filters / view switch / saved views                     │
│ Contacts          ├──────────────────────────────────────────────────────────┤
│ CRM               │                                                          │
│ Sales             │                  Page content                            │
│ Projects          │                                                          │
│ Reports           │                                                          │
│                   │                                                          │
│ User / role       │                                                          │
└───────────────────┴──────────────────────────────────────────────────────────┘
```

Desktop uses a persistent sidebar. Below 900 px it becomes a horizontally scrollable top module
bar. Page-level actions stay close to the title, while filters belong above content.

## CRM kanban

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Opportunities                              Search...       + Opportunity     │
│ Owner: Me   Customer: All   Activity: Any              Kanban | List        │
├──────────────────┬──────────────────┬──────────────────┬─────────────────────┤
│ NEW          4   │ QUALIFIED    3   │ PROPOSAL     2   │ WON             8   │
│ ┌──────────────┐ │ ┌──────────────┐ │ ┌──────────────┐ │ ┌─────────────────┐ │
│ │ Acme rollout │ │ │ Mirai audit  │ │ │ Lotus setup  │ │ │ Nova support    │ │
│ │ Acme · 25m   │ │ │ 12m · Today  │ │ │ 44m · Jul 30 │ │ │ 18m · Minh      │ │
│ │ Minh       ● │ │ │ Lan        ○ │ │ │ An         ● │ │ │ ✓ Won           │ │
│ └──────────────┘ │ └──────────────┘ │ └──────────────┘ │ └─────────────────┘ │
│ + Add            │ + Add            │ + Add            │                     │
└──────────────────┴──────────────────┴──────────────────┴─────────────────────┘
```

Cards expose customer, expected revenue, owner, and activity urgency. Dragging changes stage only;
Won and Lost require a confirmation action.

## Customer detail

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Customers     Acme Ltd                         Active      Edit            │
│ Technology · minh@example.com · +84 ...                                  ⋮   │
├───────────────────────────────────────┬──────────────────────────────────────┤
│ Contacts                              │ Summary                              │
│ Linh Nguyen · Procurement             │ Open opportunities       2           │
│ An Tran · Engineering                 │ Draft quotations         1           │
│ + Add contact                         │ Active projects          1           │
├───────────────────────────────────────┴──────────────────────────────────────┤
│ Activity timeline                                                           │
│ Quotation Q-00012 created · Opportunity moved to Proposal · Customer created│
└──────────────────────────────────────────────────────────────────────────────┘
```

## Quotation editor

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Quotations     Q-00012 · Draft                   Save     Mark sent        │
├──────────────────────────────────────────────────────────────────────────────┤
│ Customer [Acme Ltd                  ]   Valid until [2026-08-31]             │
│ Opportunity [Acme rollout           ]                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Product                 Description             Qty       Unit        Total  │
│ Implementation          Initial setup             2    4,000.00     8,000.00 │
│ Support                 Monthly support            3    1,000.00     3,000.00 │
│ + Add line                                                   Total 11,000.00 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Notes                                                                        │
│ [Delivery begins within five business days...]                             │
│                                                Cancel     Confirm quotation  │
└──────────────────────────────────────────────────────────────────────────────┘
```

The server is authoritative for calculated totals. Confirmation uses a separate, destructive-style
dialog that explains the opportunity and project changes.

## Project task board

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Acme rollout         Active       Customer: Acme       + Task               │
│ Manager: Minh        6/12 done     Due: Aug 30                               │
├──────────────────┬──────────────────┬──────────────────┬─────────────────────┤
│ TODO         3   │ IN PROGRESS  2   │ REVIEW       1   │ DONE            6   │
│ Discovery        │ Configure        │ Customer UAT     │ Kick-off            │
│ Lan · Jul 31     │ An · Aug 02      │ Minh · Aug 05    │ ✓ Jul 28             │
│                  │                  │                  │                     │
│ + Add task       │                  │                  │                     │
└──────────────────┴──────────────────┴──────────────────┴─────────────────────┘
```

## Empty, loading, and error states

- Empty state explains the business value and offers one primary create action.
- Loading uses stable skeletons that preserve page dimensions.
- Inline validation stays next to fields; server failures also appear in a page-level alert.
- Permission-denied states never imply that a record does not exist unless information disclosure
  would be unsafe.
