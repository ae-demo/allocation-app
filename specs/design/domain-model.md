# Domain Model

The core entities behind customers, engagements, allocation requests, allocations, and team members.

```mermaid
erDiagram
    CUSTOMER ||--o{ ENGAGEMENT : has
    ENGAGEMENT ||--o{ STAFFING_PLAN_LINE : plans
    ENGAGEMENT ||--o{ ALLOCATION_REQUEST : requests
    ALLOCATION_REQUEST ||--o| ALLOCATION : fulfills
    TEAM_MEMBER ||--o{ ALLOCATION : "assigned to"

    CUSTOMER {
        string id
        string name
        string contactName
        string contactEmail
        string contactPhone
    }
    ENGAGEMENT {
        string id
        string customerId
        string name
        string description
        date startDate
        date endDate
        string status
        string ownerAccountManagerId
    }
    STAFFING_PLAN_LINE {
        string id
        string engagementId
        string role
        int targetHeadcount
    }
    TEAM_MEMBER {
        string id
        string name
        string email
        string title
    }
    ALLOCATION_REQUEST {
        string id
        string engagementId
        string role
        int utilizationPct
        date startDate
        date endDate
        string status
        string requestedByAccountManagerId
        string rejectionReason
    }
    ALLOCATION {
        string id
        string allocationRequestId
        string engagementId
        string teamMemberId
        string role
        int utilizationPct
        date startDate
        date endDate
        string status
    }
```

- `ENGAGEMENT.status` is `Active` or `Closed`.
- `ALLOCATION_REQUEST.status` is `Pending`, `Approved`, or `Rejected`.
- `ALLOCATION.status` tracks whether an assignment is currently active or has ended.
- An `ALLOCATION` optionally traces back to the `ALLOCATION_REQUEST` it fulfilled.

