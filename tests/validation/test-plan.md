# Validation test plan — allocation-app v2

Target app: `allocation-webapp` (primary), backed by `allocation-api`.
Sign-in: Thunder SSO gate at `/` → redirected to `https://thunder.../gate/signin`,
a username/password form, `Sign In` button, then redirected back to a
role-specific landing route. See `tests/e2e/lib/auth.ts`.

## Known platform-level finding (affects many criteria below)

Explored live with playwright-cli before authoring: every login (Account
Manager, Resource Manager, Allocation Admin) that exercises a role-gated
allocation-api action — creating a customer, listing pending allocation
requests, listing the team directory — receives HTTP 403 `forbidden` from
`allocation-api`, rendered by the webapp as a red "forbidden" alert. Verified
independently with a direct `curl` against the API's own ingress carrying the
role's live bearer token: same 403, body `{"code":403,"message":"forbidden",
"description":"Team Members may not view allocation requests"}`.

Root cause (read from committed source, not modified): `allocation-api`
(`allocation-api/auth.bal` `resolveCaller`) owns its own per-caller role
directory keyed by `X-User-Id`, cold-starting any never-seen id at "Team
Member" (`security.json` `coldStartRole`) and persisting that forever. The
webapp's own nginx (`allocation-webapp/nginx/default.conf`) explicitly clears
`X-User-Id`/`X-User-Name`/`X-User-Groups`/`X-User-Ou` on every `/api/` call,
trusting "the gateway" to re-inject them from the validated Thunder token —
but this environment's wiring proxies straight to a direct Service backend
with no such identity-asserting gateway in between, and `security.json`'s
`testUsers` role list (`test-account-manager` → Account Manager, etc.) is
never synced into `allocation-api`'s `app_user` table. Every real login
therefore resolves, from the API's point of view, to a brand-new cold-start
"Team Member" — which is why Team Member's own "My Allocations" view (the one
screen that role is entitled to) works, and every Account Manager / Resource
Manager / Allocation Admin action beyond that is rejected.

This is a genuine defect in the deployed system, not test brittleness: the
spec for each affected criterion is authored to do exactly what the `must`
requires and is expected to, and does, fail honestly against the live app. Per
`healing.md` ("App itself misbehaves ... → genuine. Do not touch the spec"),
these are left red and reported as failures, not healed.

The frontend's own role-based nav filtering (AC-013-b, sidebar links) is
driven client-side from the Thunder ID token's `groups` claim and works
correctly independent of this bug — confirmed by observing each role's distinct
sidebar after login.

---

## AC-001-a — An Account Manager can create a customer with name and primary contact info

- Target: allocation-webapp (accountManager)
- Steps: 1. loginAs(accountManager) → lands on /customers. 2. Click "New
  Customer". 3. Fill Customer name / Contact name / Contact email (unique
  suffix). 4. Click "Create customer".
- Assert: no "forbidden" alert is shown, and the created customer's name is
  visible (on the customers list or on redirect to its detail page).
- Source of truth: playwright-cli live exploration (`-s=explore` session) —
  the create flow returns a "forbidden" alert live; this is REQ-001's write
  path, hit by the platform bug above. Expected to fail genuinely.

## AC-001-b — An Account Manager can create an engagement under a customer with name, description, and date range

- Target: allocation-webapp (accountManager)
- Steps: 1. loginAs(accountManager). 2. Open (or create) a customer. 3. Click
  "New Engagement". 4. Fill name, description, start/end dates. 5. Click
  "Create engagement".
- Assert: no "forbidden" alert; the engagement appears on the customer's
  engagement table.
- Source of truth: wireframes.dsl `NewEngagement`/`CustomerDetail` screens.
  Depends on AC-001-a's create succeeding to have a customer to attach to —
  expected to fail genuinely (blocked upstream by the same defect).

## AC-001-c — An Account Manager can edit a customer or engagement they created

- Target: allocation-webapp (accountManager)
- Steps: 1. loginAs(accountManager). 2. Open a customer/engagement. 3. Change
  a field. 4. Save.
- Assert: no "forbidden" alert; the changed field is reflected.
- Source of truth: openapi `updateCustomer`/`updateEngagement` (403 Forbidden
  documented). Expected to fail genuinely.

## AC-001-d — Any Account Manager can view any customer or engagement

- Target: allocation-webapp (accountManager)
- Steps: 1. loginAs(accountManager). 2. Navigate to /customers.
- Assert: the customers list loads (200, no forbidden) — `listCustomers` /
  `listEngagements` document only 401, not 403, so this is a read that should
  work even under the defect (as observed: GET without a write/role gate
  returned 200 with an empty list for other roles too).
- Source of truth: playwright-cli live exploration — customers list rendered
  successfully (empty state) for the Account Manager login.

## AC-002-a — An Admin can add a team member to the directory

- Target: allocation-webapp (allocationAdmin)
- Steps: 1. loginAs(allocationAdmin) → lands on /team-members. 2. Click "Add
  Team Member". 3. Fill Name/Email/Title. 4. Click "Add team member".
- Assert: no "forbidden" alert; the new team member appears in the directory.
- Source of truth: live exploration — GET /team-members itself already
  returns 403 for this login (see finding above), so the directory screen is
  blocked before this action can even be attempted. Expected to fail
  genuinely.

## AC-002-b — An Admin can edit a team member's directory record

- Target: allocation-webapp (allocationAdmin)
- Steps: 1. loginAs(allocationAdmin). 2. Open a team member record. 3. Change
  a field. 4. Save.
- Assert: no "forbidden" alert; the changed field is reflected.
- Source of truth: openapi `updateTeamMember` (403 documented). Same
  directory-list blocker as AC-002-a — expected to fail genuinely.

## AC-002-c — A Resource Manager can view the team member directory when assigning staff

- Target: allocation-webapp (resourceManager)
- Steps: 1. loginAs(resourceManager). 2. Navigate to the assign-team-member
  flow (from an allocation request) or directly to a team-member picker.
- Assert: team member names are visible in the picker/list, no forbidden
  alert.
- Source of truth: wireframes.dsl `AssignTeamMember` `select "Team member:
  Available developers"`. Given `listTeamMembers` itself 403s live for every
  login tested, expected to fail genuinely.

## AC-003-a — An Account Manager can submit an allocation request specifying role, utilization %, and start/end dates

- Target: allocation-webapp (accountManager)
- Steps: 1. loginAs(accountManager). 2. Open an engagement. 3. Click "Submit
  Allocation Request". 4. Fill role, utilization %, start/end dates. 5.
  Submit.
- Assert: no "forbidden" alert; the request appears on the engagement with
  status Pending.
- Source of truth: openapi `createAllocationRequest` (403 documented);
  wireframes `NewAllocationRequest`. Depends on having an engagement (blocked
  by AC-001-b) — expected to fail genuinely.

## AC-003-b — A submitted allocation request starts in Pending status

- Target: allocation-webapp (accountManager)
- Steps: same as AC-003-a, then read the status shown for the new request.
- Assert: status reads "Pending".
- Source of truth: domain-model.md (`ALLOCATION_REQUEST.status`);
  wireframes `EngagementDetail` `text "... · Pending"`. Expected to fail
  genuinely (blocked upstream).

## AC-003-c — An allocation request cannot be submitted against a Closed engagement

- Target: allocation-webapp (accountManager)
- Steps: 1. loginAs(accountManager). 2. Open a Closed engagement (or close
  one via the API criteria in REQ-012, if reachable). 3. Attempt "Submit
  Allocation Request".
- Assert: the app prevents submission (action disabled/absent, or the API
  rejects with 400) — a case where "forbidden" is NOT the expected failure
  signature, so this criterion's pass/fail depends on what is actually
  observed live, not assumed.
- Source of truth: openapi `createAllocationRequest` 400 on a closed
  engagement is the documented negative case; REQ-012.

## AC-004-a — A Resource Manager can view a list of pending allocation requests

- Target: allocation-webapp (resourceManager)
- Steps: 1. loginAs(resourceManager) → lands on /allocation-requests.
- Assert: the list renders (rows or an explicit empty state), no "forbidden"
  alert.
- Source of truth: live exploration — GET
  `/api/allocation-requests?status=Pending&limit=100` returns 403 for this
  exact login, confirmed by direct curl replay with the live bearer token.
  Expected to fail genuinely.

## AC-004-b — A Resource Manager can view the details of a single allocation request

- Target: allocation-webapp (resourceManager)
- Steps: 1. loginAs(resourceManager). 2. From the (blocked) list, open a
  request's detail/assign screen.
- Assert: request details (engagement, role, utilization %, dates) are
  visible, no forbidden alert.
- Source of truth: wireframes `AssignTeamMember`. Blocked upstream by
  AC-004-a — expected to fail genuinely.

## AC-005-a — A Resource Manager can assign a team member with role, utilization %, and date range to a request

- Target: allocation-webapp (resourceManager)
- Steps: 1. loginAs(resourceManager). 2. Open a pending request's assign
  screen. 3. Select a team member, role, utilization %, dates. 4. Click
  "Approve & Assign".
- Assert: no forbidden alert; navigates to the allocations overview with the
  new allocation visible.
- Source of truth: openapi `approveAllocationRequest`. Blocked upstream —
  expected to fail genuinely.

## AC-005-b — Approving a request creates an allocation for the assigned team member

- Target: allocation-webapp (resourceManager)
- Steps: same as AC-005-a, then check the Allocations Overview for the new
  row.
- Assert: a new allocation row for the assigned team member/engagement/role
  exists.
- Source of truth: domain-model.md `ALLOCATION_REQUEST ||--o| ALLOCATION`.
  Expected to fail genuinely (same blocker).

## AC-005-c — An approved request's status changes to Approved

- Target: allocation-webapp (resourceManager)
- Steps: same as AC-005-a, then re-open the request.
- Assert: status reads "Approved".
- Source of truth: domain-model.md. Expected to fail genuinely.

## AC-006-a — A Resource Manager can reject a pending allocation request with a reason

- Target: allocation-webapp (resourceManager)
- Steps: 1. loginAs(resourceManager). 2. Open a pending request. 3. Click
  "Reject". 4. Fill reason. 5. Click "Reject request".
- Assert: no forbidden alert; navigates back to the requests list.
- Source of truth: openapi `rejectAllocationRequest`; wireframes
  `RejectRequest`. Expected to fail genuinely.

## AC-006-b — A rejected request's status changes to Rejected and stores the reason

- Target: allocation-webapp (resourceManager)
- Steps: same as AC-006-a, then re-open the request.
- Assert: status reads "Rejected" and the reason text is shown.
- Source of truth: domain-model.md `ALLOCATION_REQUEST.rejectionReason`.
  Expected to fail genuinely.

## AC-006-c — The requesting Account Manager can see the rejection reason on the request

- Target: allocation-webapp (accountManager)
- Steps: 1. loginAs(accountManager). 2. Open the engagement whose request was
  rejected.
- Assert: the rejection reason text is visible next to the request.
- Source of truth: wireframes `EngagementDetail` `text "... · Rejected — no
  capacity"`. Depends on AC-006-a — expected to fail genuinely (no rejected
  request to observe).

## AC-007-a — A Resource Manager can view a list of all current and upcoming allocations across engagements

- Target: allocation-webapp (resourceManager)
- Steps: 1. loginAs(resourceManager). 2. Navigate to "Allocations".
- Assert: the allocations list renders (rows or explicit empty state), no
  forbidden alert.
- Source of truth: openapi `listAllocations` (401 only documented — no 403).
  Live behavior determines the outcome; author honestly and record what is
  observed.

## AC-007-b — The allocations list shows each allocation's team member, engagement, role, utilization %, and dates

- Target: allocation-webapp (resourceManager)
- Steps: same as AC-007-a; inspect columns of a row (or the empty state).
- Assert: table header exposes Team Member / Engagement / Role / Utilization
  / Dates columns.
- Source of truth: wireframes `AllocationsOverview` table header.

## AC-008-a — A Resource Manager can modify an allocation's role, utilization %, or date range

- Target: allocation-webapp (resourceManager)
- Steps: 1. loginAs(resourceManager). 2. Open an allocation's detail. 3.
  Change utilization %. 4. Click "Save changes".
- Assert: no forbidden alert; the change is reflected.
- Source of truth: openapi `updateAllocation` (403 documented); wireframes
  `AllocationDetail`. Needs an existing allocation (blocked upstream by
  AC-005) — expected to fail genuinely / not_run if none exists to open.

## AC-008-b — A Resource Manager can end an allocation before its original end date

- Target: allocation-webapp (resourceManager)
- Steps: 1. loginAs(resourceManager). 2. Open an allocation's detail. 3.
  Click "End Allocation".
- Assert: no forbidden alert; status becomes "Ended" on the overview.
- Source of truth: openapi `endAllocation` (403 documented). Same blocker.

## AC-009-a — A Team Member can view a list of their own current and upcoming allocations

- Target: allocation-webapp (teamMember)
- Steps: 1. loginAs(teamMember) → lands on /my-allocations.
- Assert: the page renders without a forbidden alert (rows, or the observed
  "No allocations yet" empty state).
- Source of truth: live exploration — this screen loaded cleanly (empty
  state) for the Team Member login; the one role unaffected by the platform
  finding above (it IS the cold-start role).

## AC-009-b — Each allocation shown to the Team Member includes the engagement, role, and utilization %

- Target: allocation-webapp (teamMember)
- Steps: same as AC-009-a; inspect table header/columns.
- Assert: table header exposes Engagement / Role / Utilization (/ Dates /
  Status) columns.
- Source of truth: wireframes `MyAllocations` table header — verifiable even
  against the empty state.

## AC-009-c — A Team Member cannot view another team member's allocations

- Target: allocation-webapp (teamMember) + request fixture
- Steps: 1. loginAs(teamMember), capture the session. 2. Via the `request`
  fixture (or app UI, if it exposes a teamMemberId param), request
  `/api/allocations?teamMemberId=<some-other-id>`.
- Assert: the response does not return another team member's allocations
  (403/empty-scoped-to-self), per openapi "defaults to caller when they are a
  Team Member".
- Source of truth: openapi `listAllocations` `teamMemberId` param
  description.

## AC-010-a — An Admin can view a report showing utilization % across all team members

- Target: allocation-webapp (allocationAdmin)
- Steps: 1. loginAs(allocationAdmin). 2. Navigate to "Utilization".
- Assert: the report renders (chart/table or explicit empty state), no
  forbidden alert.
- Source of truth: openapi `getUtilizationReport` (403 documented);
  wireframes `UtilizationReport`. Same platform blocker — expected to fail
  genuinely.

## AC-010-b — The report reflects the sum of a team member's active allocation utilization %

- Target: allocation-webapp (allocationAdmin)
- Steps: same as AC-010-a; read a team member's total utilization value.
- Assert: the value shown matches the sum implied by that member's active
  allocations (or, if the report itself is blocked, this cannot be observed
  and is reported not_run).
- Source of truth: TeamMemberUtilization schema.

## AC-011-a — An Account Manager can add a role with a target headcount to an engagement's staffing plan

- Target: allocation-webapp (accountManager)
- Steps: 1. loginAs(accountManager). 2. Open "New Engagement" or an existing
  engagement's staffing plan. 3. Click "Add role", fill role + target
  headcount. 4. Save/Create.
- Assert: no forbidden alert; the staffing plan line appears.
- Source of truth: wireframes `NewEngagement` staffing-plan table; openapi
  `EngagementInput.staffingPlan`. Blocked upstream — expected to fail
  genuinely.

## AC-011-b — An Account Manager can revise an engagement's staffing plan at any time

- Target: allocation-webapp (accountManager)
- Steps: 1. loginAs(accountManager). 2. Open an existing engagement. 3.
  Change a staffing plan line's target headcount. 4. Save.
- Assert: no forbidden alert; the revised value is reflected.
- Source of truth: openapi `updateEngagement`. Blocked upstream.

## AC-011-c — Defining a staffing plan does not itself create any allocation

- Target: allocation-webapp (accountManager) + request fixture
- Steps: 1. Create/update an engagement with a staffing plan (AC-011-a). 2.
  Query `/api/allocations?engagementId=<id>`.
- Assert: no allocation exists for that engagement from the staffing-plan
  action alone.
- Source of truth: domain-model.md (`STAFFING_PLAN_LINE` has no edge to
  `ALLOCATION`). Depends on AC-011-a's create — expected not_run/failing if
  blocked upstream.

## AC-012-a — An Account Manager can close an Active engagement

- Target: allocation-webapp (accountManager)
- Steps: 1. loginAs(accountManager). 2. Open an Active engagement. 3. Click
  "Close Engagement".
- Assert: no forbidden alert; status badge becomes "Closed".
- Source of truth: openapi `closeEngagement` (403 documented); wireframes
  `EngagementDetail`. Blocked upstream — expected to fail genuinely.

## AC-012-b — A Closed engagement remains visible and its existing allocations are unaffected

- Target: allocation-webapp (accountManager)
- Steps: 1. After AC-012-a, reload the engagement detail.
- Assert: the engagement is still shown (status Closed) and any allocations
  under it are unchanged.
- Source of truth: openapi `getEngagement`. Depends on AC-012-a.

## AC-012-c — An Account Manager can reopen a Closed engagement to Active

- Target: allocation-webapp (accountManager)
- Steps: 1. Open a Closed engagement. 2. Click "Reopen" (button not shown in
  the wireframe screen text but documented by `reopenEngagement` in the
  API — locate live).
- Assert: no forbidden alert; status becomes "Active".
- Source of truth: openapi `reopenEngagement` (403 documented). Blocked
  upstream.

## AC-013-a — An unauthenticated user is redirected to sign in before reaching any role's screens

- Target: allocation-webapp, no login
- Steps: 1. Navigate directly to `/customers` (or `/`) with no prior session.
- Assert: the browser ends up on the Thunder `gate/signin` page, not on an
  app screen.
- Source of truth: playwright-cli live exploration — every unauthenticated
  visit redirected to `https://thunder..../gate/signin`. Expected to pass.

## AC-013-b — A signed-in user only sees the screens and actions permitted by their role

- Target: allocation-webapp, all four roles
- Steps: loginAs each role in turn; read the sidebar navigation links.
- Assert: Account Manager sees exactly {Customers, My Allocations}; Resource
  Manager sees {Allocation Requests, Allocations, My Allocations}; Allocation
  Admin sees {Team Members, Utilization, My Allocations}; Team Member sees
  exactly {My Allocations}.
- Source of truth: playwright-cli live exploration of all four logins'
  sidebars (captured directly, distinct per role). Expected to pass — this is
  client-side nav filtering, independent of the backend permission defect.

---

## Manual criteria (rendered as a checklist in the report, not automated)

- AC-014-a — Resource Managers are notified by email when a new allocation
  request is submitted.
- AC-014-b — The requesting Account Manager and the affected Team Member are
  notified by email when a request is approved and assigned.
- AC-014-c — The requesting Account Manager is notified by email when a
  request is rejected.
