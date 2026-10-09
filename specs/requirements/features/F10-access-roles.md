# Access roles

## Purpose

Decide which directory groups may do what in the app.

## User Stories

- F10.1 As an administrator, I pick a role, see which of the app's privileges it holds, and change them. \[webapp/src/components · settings/RoleSettings.js:59\]
- F10.2 As an administrator, I add a new role by typing the name of a directory group. \[webapp/src/components · settings/RoleSettings.js:321\]

## Decisions

- A user's roles are the directory groups recorded for them at sign-in, matched to role names exactly. \[backend · utils.bal:22\]
- The app has 33 privileges, one per page or action, and a user holds the union of their roles' privileges. \[backend · constants.bal:8\]
- Every screen, action and request is gated on one or more privileges, and holding any one of them suffices. \[backend · jwt\_interceptor.bal:41\]
- Allocating to Paid, to pre-sale and to post-sale customer engagements are separate privileges. \[backend · constants.bal:19\]
- Roles are never deleted or renamed, and the list of privileges itself is fixed. \[backend · jwt\_interceptor.bal:362\]
- Every role change is audit-logged. \[backend/modules/database · db\_functions.bal:145\]
- No: the seven actors become the platform's roles with fixed permissions, and this feature is retired

## Out of Scope

- Seeing which people hold a role; the directory owns membership. \[webapp/src/components · settings/RoleSettings.js:59\]

## Open Questions

