# Consultant allocations report

## Purpose

Report what every consultant worked on over a period, with its cost codes, for finance.

Needs: F5, F8.

## User Stories

- F7.1 As a finance analyst, I run the report for a period, for one consultant or for everyone, optionally narrowed to allocation types. \[webapp/src/components · reports/ConsultantAllocations.js:49\]
- F7.2 As a finance analyst, I see each allocation's engagement type, location, country, allocation type, consultant, department, business unit, company, engagement code, daily or hourly, calendar days, working days, working hours, engagement business unit and sales pod, engagement group, account name and GL code. \[webapp/src/components · reports/ConsultantAllocationsTable.js:19\]
- F7.3 As a finance analyst, I download the report as a CSV file. \[webapp/src/components · reports/ConsultantAllocationsTable.js:19\]

## Decisions

- A person with no allocation in the period is reported on their team's default allocation for the whole period, unless the report was narrowed to allocation types. \[webapp/src/components · reports/ConsultantAllocations.js:292\]
- Leave is reported as the person's team default allocation. \[webapp/src/components · reports/ConsultantAllocations.js:195\]
- Working days exclude Saturdays and Sundays. \[webapp/src/components · utils/utils.js:233\]
- Engagement group, account name and GL code come from the engagement code: an exact match, else a code whose sixth character is a hyphen matches on its seventh and eighth characters. \[backend/modules/database · db\_queries.bal:237\]
- Engagement business unit and sales pod are shown only when the engagement has a single funding source. \[webapp/src/components · reports/ConsultantAllocations.js:170\]
- An allocation with no engagement code is reported under its allocation type's default code. \[webapp/src/components · reports/ConsultantAllocations.js:189\]
- Allocations coded LEFT are left out of the report. \[webapp/src/components · reports/ConsultantAllocations.js:240\]

## Open Questions

1. The LEAVE and LEFT codes are conventions the report relies on; where are they set, and should the recreate model leave and departure explicitly?

