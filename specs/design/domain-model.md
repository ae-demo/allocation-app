# Domain model

An engagement is the unit of work, raised against a customer account or the organization itself, funded by one or more business units, and staffed by allocations of consultants, who are either staff or partner consultants. Engagement types, allocation types and the org structure classify them.

```mermaid
erDiagram
    ENGAGEMENT_TYPE ||--o{ ALLOCATION_TYPE : classifies
    ALLOCATION_TYPE ||--o{ ENGAGEMENT : types
    ALLOCATION_TYPE ||--o{ ALLOCATION : types
    CUSTOMER ||--o{ OPPORTUNITY : has
    OPPORTUNITY ||--o{ OPPORTUNITY_LINE_ITEM : has
    CUSTOMER ||--o{ ENGAGEMENT : "raised for"
    OPPORTUNITY_LINE_ITEM |o--o{ ENGAGEMENT : "raised for"
    ENGAGEMENT ||--|{ FUNDING_SOURCE : "funded by"
    ENGAGEMENT |o--o{ ALLOCATION : staffs
    EMPLOYEE |o--o{ ALLOCATION : fills
    PARTNER_CONSULTANT |o--o{ ALLOCATION : fills
    EMPLOYEE ||--o{ VISA : holds
    EMPLOYEE }o--o| EMPLOYEE : "reports to"
    TEAM ||--o{ EMPLOYEE : "belongs to"
    TEAM }o--|| ALLOCATION_TYPE : "defaults to"
    BUSINESS_UNIT ||--o{ PRODUCT_UNIT : has
    REGION ||--o{ SUB_REGION : has
    BUSINESS_UNIT ||--o{ FUNDING_SOURCE : funds
    PRODUCT_UNIT ||--o{ FUNDING_SOURCE : funds
    SUB_REGION ||--o{ FUNDING_SOURCE : "sold in"
    ENGAGEMENT_CODE ||--o{ ENGAGEMENT : codes
    ENGAGEMENT_CODE ||--o{ ALLOCATION : codes
    EMPLOYEE }o--o{ SKILL : has

    ENGAGEMENT_TYPE {
        int id
        string name
        string kind
        boolean isActive
    }
    ALLOCATION_TYPE {
        int id
        string name
        string department
        string color
        string defaultEngagementCode
        string engagementCodeSuffix
        boolean notifyAllocationsGroup
        string status
    }
    ENGAGEMENT {
        string id
        string requesterEmail
        string customerName
        string opportunityName
        string productName
        string engagementCode
        string engagementNature
        string country
        string address
        date startDate
        date endDate
        string customerContact
        string scope
        string requestStatus
        string engagementStatus
        boolean isContractsSigned
    }
    FUNDING_SOURCE {
        string businessUnit
        string productUnit
        string region
        string subRegion
        decimal percentage
    }
    ALLOCATION {
        string id
        string consultantEmail
        date startDate
        date endDate
        string clearanceStatus
        string allocationStatus
        string engagementCode
        boolean isTravelRequired
        boolean isRecurring
        time startTime
        time endTime
        string timeZone
        string comment
        string status
    }
    EMPLOYEE {
        string workEmail
        string firstName
        string lastName
        string jobRole
        string company
        string employmentStatus
    }
    PARTNER_CONSULTANT {
        int id
        string partner
        string firstName
        string lastName
        string country
        string personalEmail
        string mobileNumber
        string status
    }
    CUSTOMER {
        string id
        string name
        string status
        string subRegion
    }
    OPPORTUNITY {
        string id
        string name
        string ownerName
        string preSalesCode
        string postSalesEngagementCode
        boolean isWon
    }
    OPPORTUNITY_LINE_ITEM {
        string id
        string name
        string engagementCodeAuto
        date serviceStartDate
        date serviceEndDate
        boolean isTentativeDates
        string productUnit
        string businessUnit
    }
    VISA {
        string country
        string visaType
        string entryType
        date startDate
        date endDate
        string status
    }
    TEAM {
        string businessUnit
        string department
        string team
    }
    BUSINESS_UNIT {
        int id
        string name
        boolean isActive
    }
    PRODUCT_UNIT {
        int id
        string name
        boolean isCustomer
        boolean isMarketing
        boolean isInternal
        boolean isActive
    }
    REGION {
        int id
        string name
    }
    SUB_REGION {
        int id
        string name
    }
    ENGAGEMENT_CODE {
        string code
        string engagementGroup
        string accountName
        string glCode
    }
    SKILL {
        string id
        string name
    }
```

An `ENGAGEMENT` carries two lifecycles, its request status and its engagement status (F1), and an `ALLOCATION` its clearance status (F4). An allocation with no engagement is a team default allocation (F5). A `TEAM` is the business unit, department and team triple the HR system reports for an employee. `CUSTOMER`, `OPPORTUNITY`, `OPPORTUNITY_LINE_ITEM`, `EMPLOYEE`, `VISA` and `SKILL` are owned by the sales, HR, finance and skills systems the app reads from; `ENGAGEMENT`, `ALLOCATION` and `FUNDING_SOURCE` are written through the finance system; the rest are the app's own.