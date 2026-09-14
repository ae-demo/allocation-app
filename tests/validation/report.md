# Validation report

- **Issue:** #10
- **Commit:** 20f73f3cf17ca99ac89b806a93d3dadc7974463e
- **Generated:** 2026-09-14T13:03:31.084Z
- **Playwright:** 1.61.1

## Summary

| Method | Total | Pass | Fail | Not run |
|---|---|---|---|---|
| e2e | 35 | 2 | 33 | 0 |
| manual (human checklist) | 3 | — | — | — |
| scenario (not validated) | 0 | — | — | — |

## E2E results

| Criterion | Must | Status | Spec | Notes |
|---|---|---|---|---|
| AC-001-a | An Account Manager can create a customer with name and primary contact info | ❌ fail | `tests/e2e/specs/AC-001-a.spec.ts` | — |
| AC-001-b | An Account Manager can create an engagement under a customer with name, description, and date range | ❌ fail | `tests/e2e/specs/AC-001-b.spec.ts` | — |
| AC-001-c | An Account Manager can edit a customer or engagement they created | ❌ fail | `tests/e2e/specs/AC-001-c.spec.ts` | — |
| AC-001-d | Any Account Manager can view any customer or engagement | ❌ fail | `tests/e2e/specs/AC-001-d.spec.ts` | — |
| AC-002-a | An Admin can add a team member to the directory | ❌ fail | `tests/e2e/specs/AC-002-a.spec.ts` | — |
| AC-002-b | An Admin can edit a team member's directory record | ❌ fail | `tests/e2e/specs/AC-002-b.spec.ts` | — |
| AC-002-c | A Resource Manager can view the team member directory when assigning staff | ❌ fail | `tests/e2e/specs/AC-002-c.spec.ts` | — |
| AC-003-a | An Account Manager can submit an allocation request specifying role, utilization %, and start/end dates | ❌ fail | `tests/e2e/specs/AC-003-a.spec.ts` | — |
| AC-003-b | A submitted allocation request starts in Pending status | ❌ fail | `tests/e2e/specs/AC-003-b.spec.ts` | — |
| AC-003-c | An allocation request cannot be submitted against a Closed engagement | ❌ fail | `tests/e2e/specs/AC-003-c.spec.ts` | — |
| AC-004-a | A Resource Manager can view a list of pending allocation requests | ❌ fail | `tests/e2e/specs/AC-004-a.spec.ts` | — |
| AC-004-b | A Resource Manager can view the details of a single allocation request | ❌ fail | `tests/e2e/specs/AC-004-b.spec.ts` | — |
| AC-005-a | A Resource Manager can assign a team member with role, utilization %, and date range to a request | ❌ fail | `tests/e2e/specs/AC-005-a.spec.ts` | — |
| AC-005-b | Approving a request creates an allocation for the assigned team member | ❌ fail | `tests/e2e/specs/AC-005-b.spec.ts` | — |
| AC-005-c | An approved request's status changes to Approved | ❌ fail | `tests/e2e/specs/AC-005-c.spec.ts` | — |
| AC-006-a | A Resource Manager can reject a pending allocation request with a reason | ❌ fail | `tests/e2e/specs/AC-006-a.spec.ts` | — |
| AC-006-b | A rejected request's status changes to Rejected and stores the reason | ❌ fail | `tests/e2e/specs/AC-006-b.spec.ts` | — |
| AC-006-c | The requesting Account Manager can see the rejection reason on the request | ❌ fail | `tests/e2e/specs/AC-006-c.spec.ts` | — |
| AC-007-a | A Resource Manager can view a list of all current and upcoming allocations across engagements | ❌ fail | `tests/e2e/specs/AC-007-a.spec.ts` | — |
| AC-007-b | The allocations list shows each allocation's team member, engagement, role, utilization %, and dates | ❌ fail | `tests/e2e/specs/AC-007-b.spec.ts` | — |
| AC-008-a | A Resource Manager can modify an allocation's role, utilization %, or date range | ❌ fail | `tests/e2e/specs/AC-008-a.spec.ts` | — |
| AC-008-b | A Resource Manager can end an allocation before its original end date | ❌ fail | `tests/e2e/specs/AC-008-b.spec.ts` | — |
| AC-009-a | A Team Member can view a list of their own current and upcoming allocations | ❌ fail | `tests/e2e/specs/AC-009-a.spec.ts` | — |
| AC-009-b | Each allocation shown to the Team Member includes the engagement, role, and utilization % | ❌ fail | `tests/e2e/specs/AC-009-b.spec.ts` | — |
| AC-009-c | A Team Member cannot view another team member's allocations | ❌ fail | `tests/e2e/specs/AC-009-c.spec.ts` | — |
| AC-010-a | An Admin can view a report showing utilization % across all team members | ❌ fail | `tests/e2e/specs/AC-010-a.spec.ts` | — |
| AC-010-b | The report reflects the sum of a team member's active allocation utilization % | ❌ fail | `tests/e2e/specs/AC-010-b.spec.ts` | — |
| AC-011-a | An Account Manager can add a role with a target headcount to an engagement's staffing plan | ❌ fail | `tests/e2e/specs/AC-011-a.spec.ts` | — |
| AC-011-b | An Account Manager can revise an engagement's staffing plan at any time | ❌ fail | `tests/e2e/specs/AC-011-b.spec.ts` | — |
| AC-011-c | Defining a staffing plan does not itself create any allocation | ❌ fail | `tests/e2e/specs/AC-011-c.spec.ts` | — |
| AC-012-a | An Account Manager can close an Active engagement | ❌ fail | `tests/e2e/specs/AC-012-a.spec.ts` | — |
| AC-012-b | A Closed engagement remains visible and its existing allocations are unaffected | ❌ fail | `tests/e2e/specs/AC-012-b.spec.ts` | — |
| AC-012-c | An Account Manager can reopen a Closed engagement to Active | ❌ fail | `tests/e2e/specs/AC-012-c.spec.ts` | — |
| AC-013-a | An unauthenticated user is redirected to sign in before reaching any role's screens | ✅ pass | `tests/e2e/specs/AC-013-a.spec.ts` | — |
| AC-013-b | A signed-in user only sees the screens and actions permitted by their role | ✅ pass | `tests/e2e/specs/AC-013-b.spec.ts` | — |

## Failures

### AC-001-a — An Account Manager can create a customer with name and primary contact info

Spec: `tests/e2e/specs/AC-001-a.spec.ts`
Location: `AC-001-a.spec.ts:5`

```
Test timeout of 30000ms exceeded.
```

### AC-001-b — An Account Manager can create an engagement under a customer with name, description, and date range

Spec: `tests/e2e/specs/AC-001-b.spec.ts`
Location: `AC-001-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Engagement Parent Co 1789389222827' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Engagement Parent Co 1789389222827' })

```

### AC-001-c — An Account Manager can edit a customer or engagement they created

Spec: `tests/e2e/specs/AC-001-c.spec.ts`
Location: `AC-001-c.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Edit Test Co 1789389293799' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Edit Test Co 1789389293799' })

```

### AC-001-d — Any Account Manager can view any customer or engagement

Spec: `tests/e2e/specs/AC-001-d.spec.ts`
Location: `AC-001-d.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('columnheader', { name: 'Customer' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('columnheader', { name: 'Customer' })

```

### AC-002-a — An Admin can add a team member to the directory

Spec: `tests/e2e/specs/AC-002-a.spec.ts`
Location: `AC-002-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('E2E Team Member 1789389164663')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('E2E Team Member 1789389164663')

```

### AC-002-b — An Admin can edit a team member's directory record

Spec: `tests/e2e/specs/AC-002-b.spec.ts`
Location: `AC-002-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').nth(1)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row').nth(1)

```

### AC-002-c — A Resource Manager can view the team member directory when assigning staff

Spec: `tests/e2e/specs/AC-002-c.spec.ts`
Location: `AC-002-c.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').nth(1)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row').nth(1)

```

### AC-003-a — An Account Manager can submit an allocation request specifying role, utilization %, and start/end dates

Spec: `tests/e2e/specs/AC-003-a.spec.ts`
Location: `AC-003-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Request Test Co 1789389443512' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Request Test Co 1789389443512' })

```

### AC-003-b — A submitted allocation request starts in Pending status

Spec: `tests/e2e/specs/AC-003-b.spec.ts`
Location: `AC-003-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Pending Status Co 1789389516729' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Pending Status Co 1789389516729' })

```

### AC-003-c — An allocation request cannot be submitted against a Closed engagement

Spec: `tests/e2e/specs/AC-003-c.spec.ts`
Location: `AC-003-c.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Closed Engagement Co 1789389706138' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Closed Engagement Co 1789389706138' })

```

### AC-004-a — A Resource Manager can view a list of pending allocation requests

Spec: `tests/e2e/specs/AC-004-a.spec.ts`
Location: `AC-004-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Engagement', { exact: true }).or(getByText('No allocation requests'))
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Engagement', { exact: true }).or(getByText('No allocation requests'))

```

### AC-004-b — A Resource Manager can view the details of a single allocation request

Spec: `tests/e2e/specs/AC-004-b.spec.ts`
Location: `AC-004-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').nth(1)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row').nth(1)

```

### AC-005-a — A Resource Manager can assign a team member with role, utilization %, and date range to a request

Spec: `tests/e2e/specs/AC-005-a.spec.ts`
Location: `AC-005-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').nth(1)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row').nth(1)

```

### AC-005-b — Approving a request creates an allocation for the assigned team member

Spec: `tests/e2e/specs/AC-005-b.spec.ts`
Location: `AC-005-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').nth(1)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row').nth(1)

```

### AC-005-c — An approved request's status changes to Approved

Spec: `tests/e2e/specs/AC-005-c.spec.ts`
Location: `AC-005-c.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').nth(1)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row').nth(1)

```

### AC-006-a — A Resource Manager can reject a pending allocation request with a reason

Spec: `tests/e2e/specs/AC-006-a.spec.ts`
Location: `AC-006-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').nth(1)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row').nth(1)

```

### AC-006-b — A rejected request's status changes to Rejected and stores the reason

Spec: `tests/e2e/specs/AC-006-b.spec.ts`
Location: `AC-006-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').nth(1)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row').nth(1)

```

### AC-006-c — The requesting Account Manager can see the rejection reason on the request

Spec: `tests/e2e/specs/AC-006-c.spec.ts`
Location: `AC-006-c.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').nth(1)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row').nth(1)

```

### AC-007-a — A Resource Manager can view a list of all current and upcoming allocations across engagements

Spec: `tests/e2e/specs/AC-007-a.spec.ts`
Location: `AC-007-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('table')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('table')

```

### AC-007-b — The allocations list shows each allocation's team member, engagement, role, utilization %, and dates

Spec: `tests/e2e/specs/AC-007-b.spec.ts`
Location: `AC-007-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('table')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('table')

```

### AC-008-a — A Resource Manager can modify an allocation's role, utilization %, or date range

Spec: `tests/e2e/specs/AC-008-a.spec.ts`
Location: `AC-008-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('table')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('table')

```

### AC-008-b — A Resource Manager can end an allocation before its original end date

Spec: `tests/e2e/specs/AC-008-b.spec.ts`
Location: `AC-008-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('table')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('table')

```

### AC-009-a — A Team Member can view a list of their own current and upcoming allocations

Spec: `tests/e2e/specs/AC-009-a.spec.ts`
Location: `AC-009-a.spec.ts:5`

```
Test timeout of 30000ms exceeded.
```

### AC-009-b — Each allocation shown to the Team Member includes the engagement, role, and utilization %

Spec: `tests/e2e/specs/AC-009-b.spec.ts`
Location: `AC-009-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('table')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('table')

```

### AC-009-c — A Team Member cannot view another team member's allocations

Spec: `tests/e2e/specs/AC-009-c.spec.ts`
Location: `AC-009-c.spec.ts:6`

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 403
Received: 504
```

### AC-010-a — An Admin can view a report showing utilization % across all team members

Spec: `tests/e2e/specs/AC-010-a.spec.ts`
Location: `AC-010-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('table')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('table')

```

### AC-010-b — The report reflects the sum of a team member's active allocation utilization %

Spec: `tests/e2e/specs/AC-010-b.spec.ts`
Location: `AC-010-b.spec.ts:6`

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 504
```

### AC-011-a — An Account Manager can add a role with a target headcount to an engagement's staffing plan

Spec: `tests/e2e/specs/AC-011-a.spec.ts`
Location: `AC-011-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Staffing Plan Co 1789389780410' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Staffing Plan Co 1789389780410' })

```

### AC-011-b — An Account Manager can revise an engagement's staffing plan at any time

Spec: `tests/e2e/specs/AC-011-b.spec.ts`
Location: `AC-011-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Revise Plan Co 1789389846715' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Revise Plan Co 1789389846715' })

```

### AC-011-c — Defining a staffing plan does not itself create any allocation

Spec: `tests/e2e/specs/AC-011-c.spec.ts`
Location: `AC-011-c.spec.ts:6`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'No Allocation Co 1789389915541' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'No Allocation Co 1789389915541' })

```

### AC-012-a — An Account Manager can close an Active engagement

Spec: `tests/e2e/specs/AC-012-a.spec.ts`
Location: `AC-012-a.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Close Engagement Co 1789389985851' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Close Engagement Co 1789389985851' })

```

### AC-012-b — A Closed engagement remains visible and its existing allocations are unaffected

Spec: `tests/e2e/specs/AC-012-b.spec.ts`
Location: `AC-012-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Closed Visibility Co 1789390055118' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Closed Visibility Co 1789390055118' })

```

### AC-012-c — An Account Manager can reopen a Closed engagement to Active

Spec: `tests/e2e/specs/AC-012-c.spec.ts`
Location: `AC-012-c.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Reopen Engagement Co 1789390119097' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Reopen Engagement Co 1789390119097' })

```

## Manual checklist

- [ ] **AC-014-a** — Resource Managers are notified by email when a new allocation request is submitted
- [ ] **AC-014-b** — The requesting Account Manager and the affected Team Member are notified by email when a request is approved and assigned
- [ ] **AC-014-c** — The requesting Account Manager is notified by email when a request is rejected

