# Target entity relationship diagram

This is the agreed MVP data model. Week 1 implements only the custom `User` foundation; feature
owners introduce the remaining tables with reviewed migrations during weeks 2–4.

```mermaid
erDiagram
    USER {
        uuid id PK
        string username UK
        string email UK
        enum role
        boolean is_active
    }
    CUSTOMER {
        uuid id PK
        string name
        enum kind
        string email
        string phone
        uuid owner_id FK
        datetime created_at
    }
    CONTACT {
        uuid id PK
        uuid customer_id FK
        string name
        string email
        string phone
        string job_title
    }
    STAGE {
        uuid id PK
        string name
        int position
        boolean is_won
        boolean is_lost
    }
    OPPORTUNITY {
        uuid id PK
        string title
        uuid customer_id FK
        uuid contact_id FK
        uuid stage_id FK
        uuid owner_id FK
        decimal expected_revenue
        date expected_close_date
        enum status
    }
    ACTIVITY {
        uuid id PK
        uuid opportunity_id FK
        uuid assignee_id FK
        enum kind
        string summary
        datetime due_at
        datetime completed_at
    }
    PRODUCT {
        uuid id PK
        string sku UK
        string name
        decimal unit_price
        boolean is_active
    }
    QUOTATION {
        uuid id PK
        string number UK
        uuid customer_id FK
        uuid opportunity_id FK
        uuid owner_id FK
        enum status
        date valid_until
        decimal total
    }
    QUOTATION_LINE {
        uuid id PK
        uuid quotation_id FK
        uuid product_id FK
        string description
        decimal quantity
        decimal unit_price
        decimal subtotal
    }
    PROJECT {
        uuid id PK
        string name
        uuid customer_id FK
        uuid quotation_id FK
        uuid manager_id FK
        enum status
    }
    TASK {
        uuid id PK
        uuid project_id FK
        uuid assignee_id FK
        string title
        enum status
        int position
        date due_date
    }
    COMMENT {
        uuid id PK
        uuid task_id FK
        uuid author_id FK
        text body
        datetime created_at
    }

    USER ||--o{ CUSTOMER : owns
    CUSTOMER ||--o{ CONTACT : has
    CUSTOMER ||--o{ OPPORTUNITY : considers
    CONTACT o|--o{ OPPORTUNITY : represents
    STAGE ||--o{ OPPORTUNITY : groups
    USER ||--o{ OPPORTUNITY : owns
    OPPORTUNITY ||--o{ ACTIVITY : schedules
    USER ||--o{ ACTIVITY : performs
    OPPORTUNITY o|--o{ QUOTATION : produces
    CUSTOMER ||--o{ QUOTATION : receives
    USER ||--o{ QUOTATION : owns
    QUOTATION ||--|{ QUOTATION_LINE : contains
    PRODUCT ||--o{ QUOTATION_LINE : prices
    QUOTATION o|--o| PROJECT : starts
    CUSTOMER ||--o{ PROJECT : sponsors
    USER ||--o{ PROJECT : manages
    PROJECT ||--o{ TASK : contains
    USER o|--o{ TASK : performs
    TASK ||--o{ COMMENT : discusses
    USER ||--o{ COMMENT : writes
```

## Shared modeling rules

- Business entities use UUID primary keys; human-facing documents also receive sequential numbers.
- Money uses fixed-precision decimal fields and never floating point.
- Timestamps are stored in UTC and rendered in the user's locale.
- Deletion defaults to protection or soft deactivation for referenced master data.
- Derived totals are recalculated by backend services inside the write transaction.
