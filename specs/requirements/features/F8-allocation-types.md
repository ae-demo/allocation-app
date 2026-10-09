# Allocation types

## Purpose

Maintain the allocation types that classify engagements and allocations, with their default codes and how their notifications route.

## User Stories

- F8.1 As an administrator, I see the active allocation types with their engagement type, department, colour, default engagement code, code suffix and whether they notify the allocations group. \[webapp/src/components · settings/AllocationTypesSettings.js:28\]
- F8.2 As an administrator, I add an allocation type under an active engagement type, with its name, default engagement code and, optionally, a code suffix, a department and the notification setting. \[webapp/src/components · settings/AddAllocationType.js:98\]
- F8.3 As an administrator, I edit or delete an allocation type. \[webapp/src/components · settings/AllocationTypesSettings.js:28\]

## Decisions

- Name, engagement type and default engagement code are required. \[webapp/src/components · settings/AllocationTypesSettings.js:332\]
- "Notify to Allocations" decides who receives an engagement's notifications: Yes, the allocations group; No, the requester's reporting lead. \[webapp/src/components · settings/AddAllocationType.js:301\]
- An allocation type cannot be added under an inactive engagement type. \[webapp/src/components · settings/AddAllocationType.js:194\]
- Each allocation type has a colour, shown on timelines and charts. \[backend/modules/database · db\_queries.bal:29\]
- Every add, change and delete is audit-logged with the administrator's name. \[backend/modules/database · db\_functions.bal:324\]

## Open Questions

1. Nothing prevents deleting an allocation type that engagements or allocations still reference; should deletion be refused while it is in use?
2. An administrator who holds only the allocation-types privilege cannot open the settings page, which admits only the roles and partner privileges; should allocation types be reachable on their own?

