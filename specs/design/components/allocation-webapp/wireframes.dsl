// Allocation App — four roles: Account Manager, Resource Manager, Allocation Admin, Team Member

screen Customers "Account Manager browses customers and their engagements"
  navbar "AllocationApp"
  sidebar "Customers -> Customers | Team Members | Allocation Requests | Allocations | Utilization"
  row
    heading "Customers"
    right
    search "Search customers"
    button "New Customer" primary -> NewCustomer
  table "Customer | Contact | Engagements | Active" -> CustomerDetail
    row "Acme Corp | J. Rivera | 3 | 2"
    row "Globex Inc | S. Patel | 1 | 1"
    row "Initech | D. Wu | 2 | 0"

screen NewCustomer "Account Manager adds a new customer"
  navbar "AllocationApp"
  sidebar "Customers -> Customers | Team Members | Allocation Requests | Allocations | Utilization"
  breadcrumb "Customers / New customer"
  heading "New Customer"
  input "Customer name"
  input "Contact name"
  input "Contact email"
  input "Contact phone"
  row
    right
    button "Cancel" -> Customers
    button "Create customer" primary -> CustomerDetail

screen CustomerDetail "Account Manager manages a customer's engagements"
  navbar "AllocationApp"
  sidebar "Customers -> Customers | Team Members | Allocation Requests | Allocations | Utilization"
  breadcrumb "Customers / Acme Corp"
  row
    heading "Acme Corp"
    right
    button "New Engagement" primary -> NewEngagement
  text "Contact: J. Rivera — j.rivera@acme.example"
  table "Engagement | Dates | Status" -> EngagementDetail
    row "Platform Migration | Jan–Jun 2027 | Active"
    row "Support Retainer | Ongoing | Active"
    row "Q3 Audit | Jul–Sep 2026 | Closed"

screen NewEngagement "Account Manager creates an engagement with its staffing plan"
  navbar "AllocationApp"
  sidebar "Customers -> Customers | Team Members | Allocation Requests | Allocations | Utilization"
  breadcrumb "Customers / Acme Corp / New engagement"
  heading "New Engagement"
  input "Engagement name"
  textarea "Description — scope and purpose"
  row
    input "Start date"
    input "End date"
  heading "Staffing plan"
  table "Role | Target headcount"
    row "Developer | 2"
    row "Tech Lead | 1"
  button "Add role"
  row
    right
    button "Cancel" -> CustomerDetail
    button "Create engagement" primary -> EngagementDetail

screen EngagementDetail "Account Manager tracks an engagement's staffing plan and requests"
  navbar "AllocationApp"
  sidebar "Customers -> Customers | Team Members | Allocation Requests | Allocations | Utilization"
  breadcrumb "Customers / Acme Corp / Platform Migration"
  row
    heading "Platform Migration"
    badge "Active" success
  text "Jan 2027 – Jun 2027 — Acme Corp"
  split 60/40
    left
      heading "Staffing plan"
      table "Role | Target | Filled"
        row "Developer | 2 | 1"
        row "Tech Lead | 1 | 0"
      row
        right
        button "Submit Allocation Request" primary -> NewAllocationRequest
    right
      heading "Requests on this engagement"
      text "Developer · 100% · Pending"
      text "Tech Lead · 50% · Rejected — no capacity"
      row
        right
        button "Close Engagement"  // in place — toggles status to Closed

screen NewAllocationRequest "Account Manager requests a team member for an engagement"
  navbar "AllocationApp"
  sidebar "Customers -> Customers | Team Members | Allocation Requests | Allocations | Utilization"
  breadcrumb "Customers / Acme Corp / Platform Migration / New request"
  heading "New Allocation Request"
  row
    select "Role: Developer"
    input "Utilization % — e.g. 100"
  row
    input "Start date"
    input "End date"
  row
    right
    button "Cancel" -> EngagementDetail
    button "Submit request" primary -> EngagementDetail

screen AllocationRequests "Resource Manager reviews pending staffing requests"
  navbar "AllocationApp"
  sidebar "Allocation Requests -> AllocationRequests | Allocations | Team Members | Utilization"
  row
    heading "Allocation Requests"
    right
    select "Status: Pending"
  table "Engagement | Role | Utilization | Requested by | Dates" -> AssignTeamMember
    row "Platform Migration | Developer | 100% | J. Rivera | Feb–May 2027"
    row "Support Retainer | Tech Lead | 50% | S. Patel | ongoing"

screen AssignTeamMember "Resource Manager approves a request and assigns a team member"
  navbar "AllocationApp"
  sidebar "Allocation Requests -> AllocationRequests | Allocations | Team Members | Utilization"
  breadcrumb "Allocation Requests / Platform Migration — Developer"
  heading "Assign Team Member"
  text "Platform Migration · Developer · 100% · Feb 2027 – May 2027"
  select "Team member: Available developers"
  row
    select "Role: Developer"
    input "Utilization % — e.g. 100"
  row
    input "Start date"
    input "End date"
  row
    right
    button "Reject" -> RejectRequest
    button "Approve & Assign" primary -> AllocationsOverview

screen RejectRequest "Resource Manager rejects a request with a reason"
  navbar "AllocationApp"
  sidebar "Allocation Requests -> AllocationRequests | Allocations | Team Members | Utilization"
  breadcrumb "Allocation Requests / Platform Migration — Developer / Reject"
  heading "Reject Request"
  text "Platform Migration · Developer · 100% · Feb 2027 – May 2027"
  textarea "Reason for rejection"
  row
    right
    button "Cancel" -> AssignTeamMember
    button "Reject request" primary -> AllocationRequests

screen AllocationsOverview "Resource Manager spots over- and under-allocated team members"
  navbar "AllocationApp"
  sidebar "Allocation Requests -> AllocationRequests | Allocations -> AllocationsOverview | Team Members | Utilization"
  row
    heading "Allocations"
    right
    search "Search team member or engagement"
  table "Team Member | Engagement | Role | Utilization | Dates | Status" -> AllocationDetail
    row "A. Chen | Platform Migration | Developer | 100% | Feb–May 2027 | Active"
    row "A. Chen | Support Retainer | Developer | 50% | Ongoing | Active"
    row "M. Diaz | Q3 Audit | Tech Lead | 100% | Jul–Sep 2026 | Ended"

screen AllocationDetail "Resource Manager modifies or ends an existing allocation"
  navbar "AllocationApp"
  sidebar "Allocation Requests -> AllocationRequests | Allocations -> AllocationsOverview | Team Members | Utilization"
  breadcrumb "Allocations / A. Chen — Platform Migration"
  heading "A. Chen — Platform Migration"
  row
    select "Role: Developer"
    input "Utilization % — e.g. 100"
  row
    input "Start date"
    input "End date"
  row
    right
    button "End Allocation" -> AllocationsOverview
    button "Save changes" primary  // in place — updates this allocation

screen TeamMembers "Allocation Admin maintains the team member directory"
  navbar "AllocationApp"
  sidebar "Team Members -> TeamMembers | Utilization -> UtilizationReport | Allocation Requests | Allocations"
  row
    heading "Team Members"
    right
    search "Search team members"
    button "Add Team Member" primary -> NewTeamMember
  table "Name | Email | Title"
    row "A. Chen | a.chen@example.com | Developer"
    row "M. Diaz | m.diaz@example.com | Tech Lead"

screen NewTeamMember "Allocation Admin adds a person to the directory"
  navbar "AllocationApp"
  sidebar "Team Members -> TeamMembers | Utilization -> UtilizationReport | Allocation Requests | Allocations"
  breadcrumb "Team Members / New team member"
  heading "New Team Member"
  input "Name"
  input "Email"
  input "Title"
  row
    right
    button "Cancel" -> TeamMembers
    button "Add team member" primary -> TeamMembers

screen UtilizationReport "Allocation Admin tracks organization-wide capacity"
  navbar "AllocationApp"
  sidebar "Team Members -> TeamMembers | Utilization -> UtilizationReport | Allocation Requests | Allocations"
  heading "Utilization Report"
  chart "Utilization % by team member" 600x260
  table "Team Member | Total Utilization"
    row "A. Chen | 150%"
    row "M. Diaz | 100%"
    row "S. Okafor | 0%"

screen MyAllocations "Team Member checks their current and upcoming allocations"
  navbar "AllocationApp"
  sidebar "My Allocations -> MyAllocations"
  heading "My Allocations"
  table "Engagement | Role | Utilization | Dates | Status"
    row "Platform Migration | Developer | 100% | Feb–May 2027 | Active"
    row "Support Retainer | Developer | 50% | Ongoing | Active"

flow "Manage customers & engagements"
  role "Account Manager"
  description "An Account Manager sets up a customer, plans an engagement, and requests staffing"
  Customers
  NewCustomer
  CustomerDetail
  NewEngagement
  EngagementDetail
  NewAllocationRequest

flow "Review and assign allocations"
  role "Resource Manager"
  description "A Resource Manager reviews a pending request, assigns or rejects it, and manages allocations"
  AllocationRequests
  AssignTeamMember
  RejectRequest
  AllocationsOverview
  AllocationDetail

flow "Directory & reporting"
  role "Allocation Admin"
  description "An Admin maintains the team directory and reviews utilization"
  TeamMembers
  NewTeamMember
  UtilizationReport

flow "My allocations"
  role "Team Member"
  description "A Team Member checks where they are allocated"
  MyAllocations
