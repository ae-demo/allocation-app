# Raise and allocate a customer engagement

A Requester raises a customer engagement from a CRM opportunity, and an Allocation manager staffs it with a consultant, who is cleared and notified. (F1, F4)

```mermaid
sequenceDiagram
    actor Requester
    actor Manager as Allocation Manager
    participant allocation-webapp
    participant allocation-api
    participant sales-entity-service
    participant finance-entity-service
    participant email-notifications-service

    Requester->>allocation-webapp: pick account, opportunity, product
    allocation-webapp->>allocation-api: list opportunities / line items
    allocation-api->>sales-entity-service: read opportunity + line item
    sales-entity-service-->>allocation-api: codes, dates, product unit
    allocation-api-->>allocation-webapp: CRM-backed fields
    Requester->>allocation-webapp: submit engagement request
    allocation-webapp->>allocation-api: create engagement
    allocation-api->>finance-entity-service: insert engagement
    finance-entity-service-->>allocation-api: engagement created
    allocation-api->>email-notifications-service: notify allocations group + requester
    allocation-api-->>allocation-webapp: engagement (New)

    Manager->>allocation-webapp: open engagement, search consultant
    allocation-webapp->>allocation-api: find consultant, check availability
    allocation-api->>finance-entity-service: read consultant allocations
    Manager->>allocation-webapp: allocate consultant
    allocation-webapp->>allocation-api: create allocation (Ready for Clearance)
    allocation-api->>finance-entity-service: insert allocation
    allocation-api->>finance-entity-service: set engagement In Progress
    allocation-api->>email-notifications-service: notify consultant + lead + allocations group
    allocation-api-->>allocation-webapp: allocation created
```