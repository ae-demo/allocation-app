# allocation-app — PRD

## Problem Statement

Organizations that staff customer engagements need to track which team members are allocated to which engagements, at what capacity, and for how long. Today this typically lives in spreadsheets or scattered conversations, making it hard to see who is over- or under-allocated, to approve staffing changes with any oversight, and to give team members visibility into their own schedules.

## Solution

A web application that lets Admins set up customers, engagements, and the team member directory; lets Resource Managers review and approve staffing requests and assign team members to engagements; and lets Team Members see their own current and upcoming allocations — all in one shared system of record.

## Actors

- **Admin**: manages organization setup — customers, customer engagements, and the team member directory — and submits allocation requests when an engagement needs staffing.
- **Resource Manager**: reviews pending allocation requests, approves or rejects them, assigns specific team members (with role, utilization %, and date range) to fulfill approved requests, and can modify or end existing allocations.
- **Team Member**: views their own current and upcoming allocations across engagements, including role and utilization % on each.

## User Stories

1. As an Admin, I want to create and manage customers and their engagements, so that there is somewhere to allocate team members against.
2. As an Admin, I want to maintain a directory of team members, so that Resource Managers know who is available to allocate.
3. As an Admin, I want to submit an allocation request for an engagement — specifying the role needed, the utilization % required, and the date range — so that a Resource Manager can find and assign the right person. *assumed*
4. As a Resource Manager, I want to review pending allocation requests, so that I can decide whether to approve or reject each one.
5. As a Resource Manager, I want to assign a specific team member (with role, utilization %, and date range) to an approved allocation request, so that the engagement gets staffed.
6. As a Resource Manager, I want to reject an allocation request with a reason, so that the requester knows it was not fulfilled and why.
7. As a Resource Manager, I want to view all current and upcoming allocations across engagements, so that I can spot team members who are over- or under-allocated.
8. As a Resource Manager, I want to modify or end an existing allocation, so that changes in engagement needs are reflected promptly.
9. As a Team Member, I want to view my current and upcoming allocations across engagements, so that I know where I am expected to work and at what utilization.
10. As an Admin, I want to view a utilization report across all team members, so that I can track overall organizational capacity.

## Product Decisions

- Sign-in is via SSO through Thunder, the platform identity provider (org default).
- Allocation workflow is request-then-approval: an Admin submits a staffing request for an engagement, and a Resource Manager reviews it, then either assigns a team member or rejects it.
- Each allocation captures: team member, engagement, role on the engagement, utilization % (share of the team member's time), and a start/end date range.
- Team members and Resource Managers are notified by email of allocation-request and allocation-decision events, using Resend, the organization's transactional email provider. *assumed*

## Out of Scope

- Billing or invoicing for customer engagements.
- Time tracking / timesheets against allocations.
- Long-range capacity forecasting or headcount planning beyond the current utilization view.
- Skills-based matching or recommendation of which team member to assign — the Resource Manager chooses manually.

## Open Questions

(none currently — recent assumptions are flagged inline above and open for the user to settle)

## Further Notes

None.

