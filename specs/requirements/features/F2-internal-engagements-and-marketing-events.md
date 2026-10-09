# Internal engagements and marketing events

## Purpose

Raise internal engagements and marketing events, which carry split funding and go to approval before anyone is allocated.

Needs: F8.

## User Stories

- F2.1 As a requester, I raise an internal engagement with its description, allocation type, nature, country, address, dates and one or more funding sources. \[webapp/src/components · engagements/EngagementForm.js:233\]
- F2.2 As a requester, I raise a marketing event with its name, nature (physical, virtual or hybrid), dates and a funding split across business units, product units, regions and sub regions. \[webapp/src/components · engagements/EngagementForm.js:257\]
- F2.3 As a requester, I see internal engagements and events in one list with the same filters as customer engagements, grouped by engagement code prefix into R&amp;D, Marketing, Sales, Support &amp; Delivery, Solutions Architecture and Other Operations. \[webapp/src/components · engagements/Engagements.js:48\]
- F2.4 As a requester, I edit an internal engagement or event. \[webapp/src/components · engagements/EngagementEdit.js:7\]
- F2.5 As a requester, I complete, reopen or cancel an internal engagement or event as I would a customer engagement. \[webapp/src/components · engagements/EngagementsTable.js:170\]

## Decisions

- An internal engagement or marketing event is raised against the organization's own account, with no opportunity or product. \[webapp/src/components · engagements/EngagementForm.js:1290\]
- Its engagement code is the allocation type's default code, followed by the type's suffix when it has one. \[webapp/src/components · engagements/EngagementForm.js:1497\]
- An internal engagement's nature defaults to Off-site; a marketing event's is Physical, Virtual or Hybrid. \[webapp/src/components · utils/AppData.js:256\]
- A marketing event's funding percentages are each above zero, sum to exactly 100, and name no business unit, product unit, region and sub region combination twice. \[webapp/src/components · engagements/EngagementForm.js:1805\]
- Product units offered for funding are those flagged for internal work or for marketing, within the chosen business unit. \[webapp/src/components · engagements/FundingSourcePanelItem.js:122\]
- A marketing event's name is unique among events already raised. \[webapp/src/components · engagements/EngagementForm.js:1792\]
- A new internal engagement or event starts as Pending Approval and is listed for approval (F3); an edit while pending keeps it pending. \[webapp/src/components · engagements/EngagementForm.js:2107\]
- Raising one notifies the configured approvers for internal engagements or for marketing events, and the requester, as an approval request. \[backend/modules/email · email.bal:89\]
- When the allocation type is set not to notify the allocations group, engagement notifications go to the requester's reporting lead instead. \[backend/modules/email · email.bal:273\]

## Out of Scope

- A dedicated Events area; events live under internal engagements. \[webapp/src/components · DrawerMenuVariant.js:115\]

## Open Questions

1. Right after raising an internal engagement or event, the code holds a prompt offering to allocate consultants immediately; it is unclear whether it still opens. Is that step wanted?
2. The event-name uniqueness check exists in code but never takes effect. Should it hold in the recreate?

