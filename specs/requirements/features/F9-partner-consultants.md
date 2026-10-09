# Partner consultants

## Purpose

Keep the roster of partner-company consultants who can be allocated alongside staff.

## User Stories

- F9.1 As an administrator, I see partner consultants with their partner company, country, name, personal email, phone number and status. \[webapp/src/components · settings/PartnerResourceMgt.js:28\]
- F9.2 As an administrator, I add a partner consultant with their partner company, country, first and last name and status, and optionally a personal email and phone number. \[webapp/src/components · settings/AddPartnerPopup.js:93\]
- F9.3 As an administrator, I edit a partner consultant, including marking them as having left, or delete them. \[webapp/src/components · settings/PartnerResourceMgt.js:28\]

## Decisions

- A partner consultant is Active or Left; only Active ones can be allocated. \[webapp/src/components · settings/AddPartnerPopup.js:279\]
- A partner consultant with any allocation on record cannot be deleted; they are marked Left instead. \[webapp/src/components · settings/PartnerResourceMgt.js:194\]
- Partner consultants have no mailbox in the organization; each is identified by a generated alias built from the partner company and the consultant's names, and their notifications go to the partner allocations group. \[backend · utils.bal:75\]
- The personal email is for reference only and is never written to. \[webapp/src/components · utils/AppConstants.js:141\]
- Names allow letters of any script, apostrophes, spaces, dots and hyphens; a phone number is digits with an optional leading plus. \[backend/modules/constants · constants.bal:89\]

## Open Questions

1. How does the recreate identify a partner consultant, given the alias stands in for an identity the organization's directory does not hold?
2. The delete refusal says confirmed or rejected allocations block it, but every allocation on record counts; which is intended?

