# Team allocations

## Purpose

Keep each team's default allocations, the engineering work people do when not on an engagement, current on a timeline or in bulk from a file.

Needs: F8.

## User Stories

- F5.1 As a team manager, I pick a business unit, department and team, optionally an allocation type, and see the team's allocations on a timeline for a date range. \[webapp/src/components · allocations/AllocationsByTeam.js:91\]
- F5.2 As a team manager, I add a default allocation for a team member from the timeline, with its type, code, dates and comment. \[webapp/src/components · allocations/AllocationsTimeline.js:64\]
- F5.3 As a team manager, I update or remove a default allocation from the timeline. \[webapp/src/components · allocations/AllocationsBy.js:807\]
- F5.4 As a team manager, I upload a CSV of default allocations, see the rows that fail and why, submit the rest, and download the errors. \[webapp/src/components · teamAllocations/BulkUpload.js:88\]

## Decisions

- A default allocation belongs to no engagement and takes the allocation type's default engagement code. \[backend/modules/utils · utils.bal:66\]
- The team timeline opens from the first day of last month to the end of the month three ahead. \[webapp/src/components · teamAllocations/TeamAllocations.js:15\]
- A default allocation whose start is more than 30 days past can no longer be edited or removed. \[webapp/src/components · allocations/AllocationsBy.js:807\]
- A new default allocation is refused if the person already has another allocation in the period, and the manager is asked to reload the timeline. \[webapp/src/components · allocations/AllocationsBy.js:1741\]
- A CSV row is: company username, team, start date, end date, allocation type name; exactly five columns, with the company email domain appended to the username. \[webapp/src/components · teamAllocations/BulkUpload.js:148\]
- A row is rejected when the person is not a known employee, the allocation type name does not exist, its dates are inverted, it overlaps another row for the same person, or it overlaps an existing allocation. \[webapp/src/components · teamAllocations/BulkUpload.js:358\]
- When some rows fail, the manager may submit the valid rest and gets a text file listing one error per line. \[webapp/src/components · teamAllocations/BulkUpload.js:179\]
- Each team has one default allocation type, which the report (F7) uses when a person has no allocation. \[backend/modules/database · db\_queries.bal:213\]
- Default allocations never trigger a notification. \[backend · service.bal:533\]

## Out of Scope

- Team allocations by email or for partner consultants; the team page works by team only. \[webapp/src/components · teamAllocations/TeamAllocations.js:15\]

## Open Questions

1. The CSV's team column is read but never checked against the person's team; should it be?

