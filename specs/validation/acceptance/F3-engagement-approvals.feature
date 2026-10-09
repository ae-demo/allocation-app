Feature: F3 Engagement approvals

  @story-F3.1
  Rule: Pending internal engagements and marketing events are queued in two tabs

    Scenario: Seeing pending items split by kind
      Given an internal engagement "INT-204" pending approval and a marketing event "Platform Hackathon" pending approval
      When Priya the approver opens the approval queue
      Then "INT-204" appears under Internal Engagements and "Platform Hackathon" appears under Marketing Events

  @story-F3.2
  Rule: An approver approves a pending engagement or event

    Scenario: Approving a pending internal engagement
      Given an internal engagement "INT-204" pending approval
      When Priya the approver approves "INT-204"
      Then "INT-204" has request status "Approved"

  @story-F3.3
  Rule: An approver corrects a pending engagement or event before approving it

    Scenario: Correcting the business unit before approval
      Given a marketing event "Platform Hackathon" pending approval with business unit "Consulting"
      When Priya the approver changes its business unit to "Delivery" and approves it
      Then "Platform Hackathon" has business unit "Delivery" and request status "Approved"

  @negative
  Rule: Approval is final

    Scenario: An approved engagement cannot be un-approved
      Given an internal engagement "INT-204" already approved
      When Priya the approver tries to send "INT-204" back to pending
      Then "INT-204" still has request status "Approved"

  @story-F3.1 @negative
  Rule: Only requests pending approval appear in the queue

    Scenario: An approved engagement leaves the queue
      Given an internal engagement "INT-204" already approved
      When Priya the approver opens the approval queue
      Then "INT-204" does not appear in the queue
