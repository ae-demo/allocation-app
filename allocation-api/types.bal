// API request/response records — mirror specs/design/components/allocation-api/openapi.yaml exactly.

public type Error record {|
    int code;
    string message;
    string description?;
    string moreInfo?;
|};

public type Customer record {|
    string id;
    string name;
    string contactName;
    string contactEmail;
    string contactPhone?;
|};

public type CustomerInput record {|
    string name;
    string contactName;
    string contactEmail;
    string contactPhone?;
|};

public type CustomerPage record {|
    int count;
    string? next = ();
    string? previous = ();
    Customer[] data;
|};

public type StaffingPlanLine record {|
    string role;
    int targetHeadcount;
|};

public type Engagement record {|
    string id;
    string customerId;
    string name;
    string description?;
    string startDate;
    string endDate;
    string status;
    StaffingPlanLine[] staffingPlan?;
|};

public type EngagementInput record {|
    string customerId;
    string name;
    string description?;
    string startDate;
    string endDate;
    StaffingPlanLine[] staffingPlan?;
|};

public type EngagementPage record {|
    int count;
    string? next = ();
    string? previous = ();
    Engagement[] data;
|};

public type TeamMember record {|
    string id;
    string name;
    string email;
    string title?;
|};

public type TeamMemberInput record {|
    string name;
    string email;
    string title?;
|};

public type TeamMemberPage record {|
    int count;
    string? next = ();
    string? previous = ();
    TeamMember[] data;
|};

public type AllocationRequest record {|
    string id;
    string engagementId;
    string role;
    int utilizationPct;
    string startDate;
    string endDate;
    string status;
    string rejectionReason?;
|};

public type AllocationRequestInput record {|
    string engagementId;
    string role;
    int utilizationPct;
    string startDate;
    string endDate;
|};

public type AllocationRequestApproval record {|
    string teamMemberId;
    string role;
    int utilizationPct;
    string startDate;
    string endDate;
|};

public type RejectRequestBody record {|
    string reason;
|};

public type AllocationRequestPage record {|
    int count;
    string? next = ();
    string? previous = ();
    AllocationRequest[] data;
|};

public type Allocation record {|
    string id;
    string allocationRequestId?;
    string engagementId;
    string teamMemberId;
    string role;
    int utilizationPct;
    string startDate;
    string endDate;
    string status;
|};

public type AllocationUpdate record {|
    string role?;
    int utilizationPct?;
    string startDate?;
    string endDate?;
|};

public type AllocationPage record {|
    int count;
    string? next = ();
    string? previous = ();
    Allocation[] data;
|};

public type TeamMemberUtilization record {|
    string teamMemberId;
    string name;
    int totalUtilizationPct;
|};

public type UtilizationReport record {|
    TeamMemberUtilization[] data;
|};

// Internal row shapes — column aliases in SQL keep these mapping 1:1 to query results,
// including the fields the OpenAPI schema deliberately omits (domain-model.md /
// the issue's brief: Engagement.ownerAccountManagerId, AllocationRequest.requestedByAccountManagerId).

public type CallerContext record {|
    string userId;
    string role;
|};

public type AppUserRow record {|
    string userId;
    string role;
    string email;
|};

public type CustomerRow record {|
    string id;
    string name;
    string contactName;
    string? contactPhone;
    string contactEmail;
    string createdBy;
|};

public type EngagementRow record {|
    string id;
    string customerId;
    string name;
    string? description;
    string startDate;
    string endDate;
    string status;
    string ownerAccountManagerId;
|};

public type StaffingPlanLineRow record {|
    string role;
    int targetHeadcount;
|};

public type TeamMemberRow record {|
    string id;
    string name;
    string email;
    string? title;
|};

public type AllocationRequestRow record {|
    string id;
    string engagementId;
    string role;
    int utilizationPct;
    string startDate;
    string endDate;
    string status;
    string requestedByAccountManagerId;
    string? rejectionReason;
|};

public type AllocationRow record {|
    string id;
    string? allocationRequestId;
    string engagementId;
    string teamMemberId;
    string role;
    int utilizationPct;
    string startDate;
    string endDate;
    string originalEndDate;
    string status;
|};
