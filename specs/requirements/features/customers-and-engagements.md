# Customers &amp; Engagements

Depth for story 1 (and the staffing-plan/closing stories it surfaced, 11–12).

## Customer record

A customer captures:

- **Name** (required, unique within the organization).
- **Primary contact**: contact name, email, and phone number.

Customers have no lifecycle/status of their own — they exist as long as any of their engagements do, and are simply edited in place.

## Engagement record

An engagement belongs to exactly one customer and captures:

- **Name** (required).
- **Description**: free text describing the engagement's scope/purpose.
- **Date range**: overall start date and end date.
- **Staffing plan**: the roles the Account Manager expects to need, each with a target headcount (e.g. "2x Developer, 1x Tech Lead") — set up front, before any individual allocation request is submitted. It is a planning aid the Account Manager can revise at any time; it does not itself allocate anyone.
- **Status**: `Active` or `Closed`.
  - New engagements start `Active`.
  - While `Active`, the Account Manager can submit allocation requests against it (story 3).
  - Once `Closed`, no new allocation requests can be submitted against it; existing allocations are unaffected and continue to be tracked to their own end dates. Closing does not delete or hide the engagement — it remains visible for reporting.
  - A Closed engagement can be reopened to `Active` by the Account Manager who owns it.

## Permissions

- Any Account Manager can **view** every customer and engagement.
- Only the Account Manager who created a customer or engagement can **edit** it (including its staffing plan) or change its status.
- Deletion is not supported — a customer/engagement with no further use is closed (for engagements) rather than removed, preserving history for reporting and past allocations.

