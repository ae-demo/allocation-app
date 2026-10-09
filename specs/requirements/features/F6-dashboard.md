# Dashboard

## Purpose

See how consultants are allocated across business units today, or as of a past date.

## User Stories

- F6.1 As a finance analyst, I see allocations by engagement type, paid allocations by allocation type and non-paid allocations by allocation type, each as a chart with counts and percentages. \[webapp/src/components · dashboard/Dashboard.js:111\]
- F6.2 As a finance analyst, I narrow the dashboard to one business unit, and to a past date. \[webapp/src/components · dashboard/Dashboard.js:111\]

## Decisions

- Today's figures count live allocations on live engagements: active allocations whose allocation status is Active or Confirmed, on engagements that are Confirmed or In Progress or whose request is New or In Progress. \[backend/modules/database · db\_queries.bal:551\]
- A past date counts the allocations that covered that date, excluding deleted allocations and cancelled engagements. \[backend/modules/database · db\_queries.bal:446\]
- Team default allocations are never counted. \[backend/modules/database · db\_queries.bal:462\]
- Paid means the Paid, Paid Pre Sale and Paid Post Sale types; everything else, internal included, is non-paid. \[backend/modules/database · db\_queries.bal:480\]
- A business unit filter matches engagements funded by that unit. \[backend/modules/database · db\_queries.bal:460\]
- The past date is yesterday at the latest. \[webapp/src/components · dashboard/Dashboard.js:111\]

## Open Questions

1. An allocation carries an "allocation status" distinct from its clearance status, and the dashboard counts Active or Confirmed; what does it mean, and who sets it?

