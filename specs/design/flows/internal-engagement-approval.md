# Raise and approve an internal engagement or marketing event

A Requester raises an internal engagement or marketing event with split funding, and an Approver reviews and approves it before anyone is allocated. (F2, F3)

```mermaid
sequenceDiagram
    actor Requester
    actor Approver
    participant allocation-webapp
    participant allocation-api
    participant finance-entity-service
    participant email-notifications-service

    Requester->>allocation-webapp: raise internal engagement / marketing event
    allocation-webapp->>allocation-api: create engagement (funding split)
    allocation-api->>finance-entity-service: insert engagement (Pending Approval)
    allocation-api->>email-notifications-service: notify approvers + requester
    allocation-api-->>allocation-webapp: engagement (Pending Approval)

    Approver->>allocation-webapp: open approval queue
    allocation-webapp->>allocation-api: list pending engagements/events
    allocation-api->>finance-entity-service: search engagements (Pending Approval)
    finance-entity-service-->>allocation-api: pending list
    Approver->>allocation-webapp: correct details (optional)
    Approver->>allocation-webapp: approve
    allocation-webapp->>allocation-api: approve engagement
    allocation-api->>finance-entity-service: update engagement (Approved)
    alt nature implies travel
        allocation-api->>email-notifications-service: notify requester, allocations group, travel team
    else
        allocation-api->>email-notifications-service: notify requester, allocations group
    end
    allocation-api-->>allocation-webapp: engagement (Approved)
```