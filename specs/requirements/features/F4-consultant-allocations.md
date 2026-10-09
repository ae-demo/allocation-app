# Consultant allocations

## Purpose

Allocate staff and partner consultants to an engagement on a timeline, and take each allocation through clearance to confirmation, rejection or cancellation.

Needs: F1, F2, F8.

## User Stories

- F4.1 As an allocation manager, I open an engagement's allocation workspace and see its details, its allocations and a timeline of the people in view. \[webapp/src/components · allocations/Allocations.js:12\]
- F4.2 As an allocation manager, I find a staff member by email, or by business unit, department and team, see their existing allocations on the timeline, and add them to the engagement. \[webapp/src/components · allocations/AllocationsByMail.js:86\]
- F4.3 As an allocation manager, I allocate a partner consultant from a partner company's roster. \[webapp/src/components · allocations/AllocationsByPartner.js:75\] Needs: F9.
- F4.4 As an allocation manager, I set an allocation's type, engagement code, dates, clearance status, comment, whether travel is required and whether it is tentative, or make it hourly with recurring start and end times in a time zone. \[webapp/src/components · allocations/AddNewAllocationPopup.js:121\]
- F4.5 As an allocation manager, I add preparation and post-engagement overhead time around a paid engagement's allocation. \[webapp/src/components · allocations/AllocationsBy.js:1981\]
- F4.6 As an allocation manager, I move an allocation through clearance: ready for clearance, in progress, accepted or rejected by the consultant, confirmed, confirmed with visa pending, rejected for visa or other reasons, or cancelled. \[webapp/src/components · allocations/AllocationsBy.js:355\]
- F4.7 As an allocation manager, I see every engagement allocation in one list, filter it by account, allocation type, consultant, clearance status, dates and business unit, and update a status or comment from the list. \[webapp/src/components · engagementAllocations/EngagementAllocations.js:50\]
- F4.8 As an allocation manager, I find consultants by skill: the engagement scope yields suggested skills, I adjust them, and I search the skills register for consultants who match. \[webapp/src/components · allocations/ConsultantSearchDialog.js:107\]
- F4.9 As an allocation manager, I mark the engagement request completed from its allocation workspace, or reopen it. \[webapp/src/components · allocations/AllocationsHeaderAction.js:8\]

## Decisions

- A new allocation to a customer engagement starts Ready for Clearance; to an internal engagement it starts at the status chosen among Tentative, Clearance In Progress, Confirmed and Confirmed - Visa Pending; a partner consultant's starts Confirmed. \[webapp/src/components · allocations/AllocationsBy.js:1952\]
- Clearance moves only along these paths: Tentative or Ready for Clearance to Clearance In Progress, Confirmed, Confirmed - Visa Pending or Allocation Cancelled; Clearance In Progress to Accepted by Consultant, Rejected by Consultant or Allocation Cancelled; Accepted by Consultant to Confirmed, Confirmed - Visa Pending, Rejected by Consultant or Allocation Cancelled; Confirmed to Rejected by Consultant, Rejected - Visa Issues, Rejected - Other or Allocation Cancelled; Confirmed - Visa Pending to Confirmed, Rejected - Visa Issues, Rejected by Consultant or Allocation Cancelled. \[webapp/src/components · allocations/AllocationsBy.js:355\]
- Allocation Cancelled and the three rejections are final; an allocation in one of them no longer blocks the consultant's time. \[webapp/src/components · allocations/AllocationsBy.js:84\]
- A person cannot be allocated while another live allocation covers the period; two hourly allocations may share a day when their hours do not overlap. \[webapp/src/components · allocations/AllocationsBy.js:2185\]
- An allocation that overlaps a team default allocation trims or splits the default around it, and is refused when it would swallow the default whole. \[webapp/src/components · allocations/AllocationsBy.js:955\]
- Allocation dates lie within the engagement's window, widened by 14 days each side for overheads; overhead time is recorded as a default allocation of type Engagement Overhead, coded with the engagement code plus that type's suffix. \[webapp/src/components · allocations/AllocationsBy.js:1985\]
- Allocating to Paid, to pre-sale and to post-sale customer engagements are three separate permissions, checked per engagement. \[backend · utils.bal:114\]
- Allocating a consultant moves the engagement request to In Progress. \[webapp/src/components · allocations/AllocationsBy.js:2091\]
- No allocation can be made on an engagement whose dates are both more than five years past. \[webapp/src/components · allocations/AllocationsBy.js:2127\]
- Picking an allocation type that has a default engagement code fixes the allocation's code to it. \[webapp/src/components · allocations/AddNewAllocationPopup.js:146\]
- Each clearance change notifies the consultant, their reporting lead, the allocations group and the person acting, except Tentative and Ready for Clearance, except a cancellation straight from Ready for Clearance, and except a confirmation straight after Confirmed - Visa Pending; a partner consultant's notifications go to the partner allocations group instead. \[backend/modules/email · email.bal:667\]
- When travel is required, the travel team is copied on confirmation, and on rejection or cancellation of an allocation that had been confirmed. \[backend/modules/email · email.bal:450\]
- A confirmation notice lists the consultant's visas valid for the allocation's country and dates, flagging one that expires within a week of the allocation's end. \[backend/modules/email · email.bal:515\]
- Skill suggestions: suggested by an agent from the engagement scope and the skills register, five at most, which the manager accepts or changes. \[webapp/src/components · allocations/ConsultantSearchDialog.js:195\]
- Only employees who are Active or Marked Leaver, excluding interns, can be allocated. \[webapp/src/components · teamAllocations/BulkUpload.js:323\]
- Engagement allocations are edited from the engagement, never from the team timeline. \[webapp/src/components · allocations/AllocationsBy.js:807\]
- The allocation list opens on two months back to two months ahead. \[webapp/src/components · engagementAllocations/EngagementAllocations.js:50\]

## Open Questions

1. The consultant search sends a fixed placeholder engagement identifier instead of the real one, by its own admission a temporary fix; does the skills register need the engagement at all?
2. Who moves an allocation from Clearance In Progress to Accepted or Rejected by Consultant: today the lead answers the notification and the allocation manager records it. Should the consultant or their lead act in the app?
3. The team timeline tells users to delete engagement allocations from the engagements section, which offers no delete; is cancellation through clearance the only intended way?
4. Does the skills register stay in ServiceNow, or does the recreate hold consultant skills itself?

