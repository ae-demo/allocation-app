# Customer engagements

## Purpose

Raise, track, edit and close engagement requests for customers and prospects, built from the opportunity and product recorded in the CRM.

Needs: F8.

## User Stories

- F1.1 As a requester, I raise a customer engagement by picking the account, its opportunity and the product line item, so the request carries the CRM's codes and dates. \[backend · service.bal:181\]
- F1.2 As a requester, I choose the engagement type: Paid, Paid Pre Sale, Paid Post Sale, Non-Paid Pre Sale or Non-Paid Post Sale. \[webapp · src/Config.js:142\]
- F1.3 As a requester, I record where and how the engagement happens: on-site or off-site, country, address, customer contact, scope, business domain and comments. \[webapp/src/components · engagements/EngagementForm.js:324\]
- F1.4 As a requester, I see every customer engagement in one list, filter it by type, account, allocation type, engagement status, request status, dates and business unit, and search it. \[webapp/src/components · engagements/Engagements.js:48\]
- F1.5 As a requester, I edit an engagement, and for a paid engagement I refresh its dates from the CRM. \[webapp/src/components · engagements/EngagementForm.js:947\]
- F1.6 As a requester, I complete an engagement request once the work is done, and reopen it to In Progress if it is not. \[webapp/src/components · engagements/EngagementsTable.js:170\]
- F1.7 As a requester, I set an engagement's status, including cancelling it, which cancels every allocation on it. \[backend · service.bal:347\]
- F1.8 As a requester, I see which consultants are allocated to each engagement in the list. \[webapp/src/components · engagements/EngagementsTable.js:275\]
- F1.9 As a requester, I open the engagement's CRM record from the form. \[webapp/src/components · engagements/EngagementForm.js:2919\]

## Decisions

- A paid engagement takes its dates, business unit, product unit, sub region, allocation type and contracts-signed flag from the CRM product and they cannot be edited; a non-paid one lets the requester set them. \[webapp/src/components · engagements/EngagementForm.js:140\]
- A paid engagement cannot be raised for a product that already has an allocation request. \[webapp/src/components · engagements/EngagementForm.js:1902\]
- Only accounts in Customer or Prospect status are offered, and only line items classified CO, QS, PS, TR, TAM or CL. \[backend · constants.bal:53\]
- The engagement code is the CRM's auto code for paid types, the opportunity's pre-sale code for Non-Paid Pre Sale, and the post-sale code's prefix plus the allocation type's suffix for Non-Paid Post Sale. \[webapp/src/components · engagements/EngagementForm.js:1483\]
- A customer engagement has exactly one funding source, whose region and sub region come from the account. \[webapp/src/components · engagements/EngagementForm.js:1405\]
- A new request starts as New; an edit sets it to Updated; allocating a consultant moves it to In Progress; completing and reopening are the requester's actions. \[webapp/src/components · engagements/EngagementForm.js:2107\]
- Engagement status is one of Confirmed, Pending, In Progress, Completed or Cancelled, set by anyone allowed to change it or by the engagement's own requester. \[webapp/src/components · engagements/EngagementsTable.js:333\]
- Cancelling an engagement also cancels its request, cancels every allocation on it, notifies each allocated consultant, and copies the travel team if a confirmed allocation needed travel. \[backend · service.bal:346\]
- Raising an engagement notifies the allocations group and the requester as a consultant request; a change to its details notifies the same people. \[backend/modules/email · email.bal:67\]
- Required: type, account, opportunity, product for paid types, allocation type, engagement code, nature, country, address, customer contact, start and end dates, business unit, product unit and sub region. \[webapp/src/components · engagements/EngagementForm.js:1718\]
- The start date is on or before the end date. \[webapp/src/components · engagements/EngagementForm.js:1893\]
- The list opens on the last two years. \[webapp/src/components · engagements/Engagements.js:116\]

## Open Questions

1. Should a request whose CRM dates are tentative be refused until the dates are fixed? The code carries that rule, but it never takes effect.
2. Engagement status has five values and no rule for moving between them; which transitions matter, and who may make them?
3. Does cancelling need a confirmation beyond the ordinary status-change prompt, given it cancels every allocation on the engagement?

