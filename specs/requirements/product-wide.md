# Product-wide

Rules that apply to more than one feature.

## Requirements

- P1 Every user signs in through the organization's SSO, and what they may do follows from the directory groups they hold. \[webapp · src/Config.js:110\] Applies to: all.
- P2 A signed-in user who holds no privilege sees only a message that they are not privileged to view the app. \[webapp · src/components/Main.js:451\] Applies to: all.
- P3 The person who raised an engagement is copied on every notification about it, whoever performs the action. \[backend/modules/email · email.bal:267\] Applies to: F1, F2, F3, F4.
- P4 Every notification names the app and closes with the internal apps team's sign-off. \[backend/modules/constants · constants.bal:8\] Applies to: F1, F2, F3, F4.
- P5 Deleting an allocation, an allocation type or a partner consultant marks it Deleted and hides it from every list; nothing is destroyed. \[backend/modules/constants · constants.bal:51\] Applies to: F4, F5, F8, F9.
- P6 Changes to access roles and to allocation types are written to an audit log with who made them and when. \[backend/modules/database · db\_functions.bal:536\] Applies to: F8, F10.
- P7 Customer engagements and their allocations may be dated up to five years in the past; internal engagements, marketing events and team allocations at most 30 days. \[webapp/src/components · utils/AppConstants.js:199\] Applies to: F1, F2, F4, F5.
- P8 Free text that looks like markup or code is refused before it is saved. \[webapp/src/components · utils/utils.js:423\] Applies to: F1, F2, F3, F4, F5, F8, F9.
- P9 A session idle for 30 minutes is warned, and signed out 30 seconds later unless the user chooses to stay. \[webapp/src/components · IdleTimer.js:29\] Applies to: all.
- P10 Staff are identified by their company email address; partner consultants by a generated alias (F9). \[backend/modules/constants · constants.bal:71\] Applies to: F4, F5, F7, F9.
- P11 Engagement and allocation lists are searched, sorted and paged on the server, 30 rows at a time. \[webapp/src/components · utils/AppConstants.js:220\] Applies to: F1, F2, F3, F4.

## Decisions

- Engagements come in seven types of two kinds: customer (Paid, Paid Pre Sale, Paid Post Sale, Non-Paid Pre Sale, Non-Paid Post Sale) and internal (Internal Engagement, Marketing Event). \[backend · constants.bal:47\]
- The organization's own account stands as the customer of every internal engagement and marketing event. \[backend · service.bal:195\]
- Customers, opportunities and products: `sales-entity-service`, the organization's sales entity service, which fronts Salesforce. \[backend/modules/entity · clients.bal:43\]
- Employees, org structure and reporting lines: `hr-entity-service`, the organization's HR entity service, which fronts the HR information system. \[backend/modules/entity · clients.bal:30\]
- Engagements, allocations and visas: `finance-entity-service`, the organization's finance entity service, the system of record the app reads and writes through. \[backend/modules/entity · clients.bal:19\]
- Notifications: `email-notifications-service`, the organization's email notifications service, which fronts the mail system; every notice is sent from one allocation manager address. \[backend/modules/email · client.bal:29\]
- A notification shows one business unit, product unit and sub region: an engagement notice shows its first funding source, an allocation notice shows them only when the engagement has a single funding source. \[backend/modules/email · email.bal:222\]
- Consultant skills and skill-based consultant search: `consultant-skills-servicenow`, the organization's ServiceNow skills register, the system of record. \[backend/modules/servicenow · client.bal:12\]
- Dates are shown as yyyy-MM-dd, and timelines default to the Colombo time zone. \[webapp · src/Config.js:235\]

## Open Questions

1. The allocation-type settings page says that with "Notify to Allocations" set to No, engagement notifications go to the leads of the type's department, except for marketing events, which go only to the requester's lead; the service sends them to the requester's own reporting lead for every type. Which is the rule?
2. Three recipient settings the service requires, the sending address and the two approver lists, are absent from the checked-in local configuration; who should receive approval requests?
3. Does the recreate keep reading customers, opportunities and products through the sales entity service, or go to Salesforce directly?
4. Does the recreate keep reading employees and the org structure through the HR entity service, or go to the HR information system directly?
5. Does the recreate keep sending notices through the email notifications service, or send mail itself?