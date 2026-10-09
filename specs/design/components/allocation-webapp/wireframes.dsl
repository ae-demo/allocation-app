screen EngagementsList "Customer and internal engagements, filterable and searchable"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  row
    search "Search engagements"
    select "Type"
    select "Business unit"
    select "Request status"
    right
    button "Raise Engagement" primary -> RaiseEngagementForm
  table "Account | Type | Code | Dates | Request Status | Engagement Status | Consultants" -> EngagementDetail
    row "Acme Corp | Paid | ENG-1021 | 2026-11-01 - 2027-02-01 | In Progress | Confirmed | 2"
    row "Riverside Labs | Non-Paid Pre Sale | ENG-1033 | 2026-10-15 - 2026-12-15 | New | Pending | 0"
    row "Internal | Internal Engagement | INT-204 | 2026-09-01 - 2026-12-31 | Updated | In Progress | 1"

screen RaiseEngagementForm "Raise a customer, internal engagement or marketing event"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  heading "Raise Engagement"
  select "Engagement type"
  row
    select "Account"
    select "Opportunity"
    select "Product line item"
  row
    input "Country"
    input "Address"
  input "Customer contact"
  textarea "Scope"
  row
    input "Start date"
    input "End date"
  card "Funding sources"
    table "Business unit | Product unit | Region | Sub region | %"
      row "Consulting | Delivery | APAC | ANZ | 100"
    button "Add funding source"
  row
    button "Cancel" -> EngagementsList
    right
    button "Submit" primary -> EngagementDetail

screen EngagementDetail "One engagement, its funding and its consultants"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  breadcrumb "Engagements / Acme Corp / ENG-1021"
  card "Engagement"
    badge "In Progress" info
    row
      text "Account | Acme Corp"
      text "Type | Paid"
      text "Code | ENG-1021"
    row
      text "Dates | 2026-11-01 - 2027-02-01"
      text "Scope | Platform migration advisory"
    link "Go to CRM record"
  table "Consultant | Role | Dates | Clearance"
    row "jane.doe@company.com | Lead consultant | 2026-11-01 - 2027-02-01 | Confirmed"
  row
    button "Edit" -> EditEngagementForm
    button "Fetch New Dates from CRM"
    button "Allocate Consultant" -> AllocationWorkspace
    right
    button "Complete"
    button "Cancel" danger

screen EditEngagementForm "Edit an engagement's details"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  heading "Edit Engagement"
  row
    input "Country"
    input "Address"
  textarea "Scope"
  row
    input "Start date"
    input "End date"
  row
    button "Cancel" -> EngagementDetail
    right
    button "Save" primary -> EngagementDetail

screen ApprovalQueue "Internal engagements and marketing events pending approval"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  tabs "Internal Engagements | Marketing Events"
  row
    search "Search"
    select "Business unit"
  table "Name | Type | Business Unit | Dates | Request Status" -> ApprovalDetail
    row "Platform Hackathon | Marketing Event | Consulting | 2026-11-10 - 2026-11-12 | Pending Approval"
    row "Internal Tooling | Internal Engagement | Delivery | 2026-10-01 - 2026-12-01 | Pending Approval"

screen ApprovalDetail "Correct and approve a pending engagement or event"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  heading "Approve Engagement / Event"
  row
    select "Sub region"
    select "Product unit"
    select "Business unit"
  row
    input "Country"
    select "Allocation type"
  row
    input "Start date"
    input "End date"
  row
    button "Update" -> ApprovalQueue
    right
    button "Confirm and Approve" primary -> ApprovalQueue

screen AllocationsList "Every allocation, filterable and searchable"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  row
    search "Search"
    select "Account"
    select "Allocation type"
    select "Clearance status"
  table "Consultant | Account | Allocation Type | Dates | Clearance" -> AllocationWorkspace
    row "jane.doe@company.com | Acme Corp | Paid | 2026-11-01 - 2027-02-01 | Confirmed"
    row "john.smith@company.com | Riverside Labs | Paid Pre Sale | 2026-10-15 - 2026-12-15 | Clearance In Progress"

screen AllocationWorkspace "An engagement's allocations on a timeline"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  breadcrumb "Allocations / Acme Corp / ENG-1021"
  card "Engagement"
    text "Acme Corp | Paid | 2026-11-01 - 2027-02-01"
  chart "Consultant timeline" 600x220
  table "Consultant | Dates | Clearance | Travel | Comment"
    row "jane.doe@company.com | 2026-11-01 - 2027-02-01 | Confirmed | No | Lead"
  row
    button "Find Consultant" -> ConsultantSearch
    right
    button "Allocate Consultant" primary -> AddAllocationForm

screen ConsultantSearch "Find a consultant by email, team, or matching skills"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  tabs "By Email | By Team | By Skill"
  row
    search "Search by email"
    right
    button "Search"
  card "Suggested skills" ai
    badge "GraphQL" ai
    badge "Kubernetes" ai
    badge "Stakeholder management" ai
  table "Name | Email | Skills | Select" -> AddAllocationForm
    row "Jane Doe | jane.doe@company.com | GraphQL, Kubernetes | Select"

screen AddAllocationForm "Allocate a consultant to the engagement"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  heading "Allocate Consultant"
  row
    input "Consultant email"
    select "Allocation type"
  row
    input "Start date"
    input "End date"
  row
    toggle "Travel required"
    toggle "Tentative"
  textarea "Comment"
  row
    button "Cancel" -> AllocationWorkspace
    right
    button "Save Allocation" primary -> AllocationWorkspace

screen TeamTimeline "A team's default allocations on a timeline"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  row
    select "Business unit"
    select "Department"
    select "Team"
    select "Allocation type"
    right
    button "Bulk Upload" -> BulkUpload
  chart "Team timeline" 700x260
  table "Member | Allocation Type | Dates | Comment"
    row "jane.doe@company.com | Engineering Overhead | 2026-10-01 - 2026-12-31 | Default"
  button "Add Allocation" primary -> AddTeamAllocationForm

screen AddTeamAllocationForm "Add a default allocation for a team member"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  heading "Add Default Allocation"
  input "Consultant email"
  select "Allocation type"
  row
    input "Start date"
    input "End date"
  textarea "Comment"
  row
    button "Cancel" -> TeamTimeline
    right
    button "Save" primary -> TeamTimeline

screen BulkUpload "Upload a CSV of default allocations"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  heading "Bulk Upload Default Allocations"
  image "Drop CSV file here"
  table "Row | Username | Team | Start | End | Type | Error"
    row "4 | j.lee | - | 2026-10-01 | 2026-10-05 | Unknown | Allocation type not found"
  row
    button "Download Error File"
    right
    button "Add Allocations" primary // submits valid rows in place, stays on this screen

screen Dashboard "Allocations by engagement type and allocation type"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  row
    select "Business unit"
    select "Today | Past date"
  row
    chart "Allocations by engagement type" 350x260
    chart "Paid allocations by allocation type" 350x260
    chart "Non-paid allocations by allocation type" 350x260

screen ConsultantReport "What every consultant worked on, with cost codes"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  row
    input "Start date"
    input "End date"
    input "Consultant email"
    select "Allocation types"
    right
    button "Run Report" primary
  table "Consultant | Engagement Type | Code | Business Unit | Days | Hours | Account | GL Code"
    row "jane.doe@company.com | Paid | ENG-1021 | Consulting | 92 | 736 | Acme Corp | GL-100"
  button "Download CSV" // exports the rows already shown, stays in place

screen AllocationTypesSettings "Active allocation types"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  tabs "Allocation Types | Partner Consultants | Access Roles"
  row
    right
    button "Add Allocation Type" primary -> AllocationTypeForm
  table "Name | Engagement Type | Department | Default Code | Notify Allocations" -> AllocationTypeForm
    row "Billable | Paid | Consulting | ENG | Yes"
    row "Bench | Internal Engagement | Delivery | INT-BENCH | No"

screen AllocationTypeForm "Add or edit an allocation type"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  heading "Allocation Type"
  select "Engagement type"
  input "Name"
  input "Default engagement code"
  input "Code suffix"
  input "Department"
  toggle "Notify to Allocations"
  row
    button "Delete" danger -> AllocationTypesSettings
    right
    button "Cancel" -> AllocationTypesSettings
    button "Save" primary -> AllocationTypesSettings

screen PartnerConsultantsSettings "Partner-company consultants"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  tabs "Allocation Types | Partner Consultants | Access Roles"
  row
    right
    button "Add Partner Consultant" primary -> PartnerConsultantForm
  table "Partner | Name | Country | Status" -> PartnerConsultantForm
    row "Acme Partners | Alex Reed | Singapore | Active"
    row "Delta Staffing | Priya Nair | India | Left"

screen PartnerConsultantForm "Add or edit a partner consultant"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  heading "Partner Consultant"
  input "Partner company"
  row
    input "First name"
    input "Last name"
  input "Country"
  row
    input "Personal email (reference only)"
    input "Mobile number"
  select "Status"
  row
    button "Delete" danger -> PartnerConsultantsSettings
    right
    button "Cancel" -> PartnerConsultantsSettings
    button "Save" primary -> PartnerConsultantsSettings

screen AccessRolesView "The app's roles and the privileges each holds"
  navbar "Allocations App"
  sidebar "Engagements -> EngagementsList | Approvals -> ApprovalQueue | Allocations -> AllocationsList | Team Allocations -> TeamTimeline | Dashboard -> Dashboard | Reports -> ConsultantReport | Settings -> AllocationTypesSettings"
  tabs "Allocation Types | Partner Consultants | Access Roles"
  table "Role | Granted Privileges"
    row "Requester | engagements:create, engagements:read, engagements:update, engagements:manage-status"
    row "Approver | approvals:review, approvals:approve"
    row "AllocationManager | allocations:allocate, allocations:read, allocations:manage-clearance"

flow "Raise and track engagements"
  role "Requester"
  description "A requester raises a customer or internal engagement and tracks it to completion"
  EngagementsList
  RaiseEngagementForm
  EngagementDetail
  EditEngagementForm

flow "Approve internal work"
  role "Approver"
  description "An approver reviews and approves pending internal engagements and marketing events"
  ApprovalQueue
  ApprovalDetail

flow "Allocate and clear consultants"
  role "AllocationManager"
  description "An allocation manager staffs an engagement and moves the allocation through clearance"
  AllocationsList
  AllocationWorkspace
  ConsultantSearch
  AddAllocationForm

flow "Keep team defaults current"
  role "TeamManager"
  description "A team manager keeps a team's default allocations current, one at a time or in bulk"
  TeamTimeline
  AddTeamAllocationForm
  BulkUpload

flow "Dashboard and reporting"
  role "FinanceAnalyst"
  description "A finance analyst reads the allocation dashboard and runs the consultant allocations report"
  Dashboard
  ConsultantReport

flow "Admin settings"
  role "Administrator"
  description "An administrator maintains allocation types and partner consultants, and reviews access roles"
  AllocationTypesSettings
  AllocationTypeForm
  PartnerConsultantsSettings
  PartnerConsultantForm
  AccessRolesView
