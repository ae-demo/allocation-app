# Submit and Approve an Allocation Request

An Account Manager raises a staffing need on their engagement; a Resource Manager reviews it and either assigns a team member or rejects it, with email notifications at each step.

```mermaid
sequenceDiagram
    actor AccountManager as Account Manager
    actor ResourceManager as Resource Manager
    participant webapp as allocation-webapp
    participant api as allocation-api
    participant resend

    AccountManager->>webapp: submit allocation request (role, utilization %, dates)
    webapp->>api: create allocation request
    api->>resend: notify Resource Managers of new request
    ResourceManager->>webapp: review pending requests
    alt approve
        ResourceManager->>webapp: assign team member (role, utilization %, dates)
        webapp->>api: approve request + create allocation
        api->>resend: notify Account Manager + Team Member of assignment
    else reject
        ResourceManager->>webapp: reject with reason
        webapp->>api: reject request
        api->>resend: notify Account Manager of rejection
    end
```

