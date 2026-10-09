# Engagement approvals

## Purpose

Approve pending internal engagements and marketing events, correcting them first when needed.

Needs: F2.

## User Stories

- F3.1 As an approver, I see the internal engagements and the marketing events waiting for approval in two tabs, filtered by business unit and searched by text. \[webapp/src/components · approveEngagements/ApproveEngagementView.js:48\]
- F3.2 As an approver, I open a pending engagement or event and approve it. \[webapp/src/components · approveEngagements/ApproveAction.js:14\]
- F3.3 As an approver, I correct a pending engagement or event, its dates, sub region, product unit, business unit, country or allocation type, and approve it in the same step or send it back as updated. \[webapp/src/components · approveEngagements/EditAction.js:16\]

## Decisions

- Approval is final; an approved engagement cannot be un-approved. \[webapp/src/components · utils/AppConstants.js:50\]
- Approving notifies the requester and the allocations group, or the requester's lead, as Approved, or as Updated and Approved when details changed in the same step. \[backend/modules/email · email.bal:135\]
- When an approved engagement's nature implies travel (physical, hybrid or on-site), the travel team is copied so arrangements can start. \[backend/modules/email · email.bal:285\]
- Only requests in Pending Approval appear in the queue, which opens on the last two years. \[webapp/src/components · approveEngagements/ApproveTable.js:181\]
- Viewing, editing and approving are separate permissions, granted per kind: internal engagements, and marketing events. \[backend · constants.bal:39\]

## Open Questions

1. There is no reject action; a request that should not go ahead is cancelled by its requester. Is an explicit rejection, with a reason sent back, wanted?

