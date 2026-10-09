Feature: F2 Internal engagements and marketing events

  @story-F2.1
  Rule: A requester raises an internal engagement against the organization's own account

    Scenario: Raising an internal engagement
      When Olivia the requester raises an internal engagement with description "Platform tooling", country "Singapore", address "1 Raffles Place" and dates "2026-10-01" to "2026-12-01"
      Then the internal engagement list has one more engagement, raised against the organization's own account

  @story-F2.2
  Rule: A marketing event's funding split must sum to exactly 100 percent

    Scenario: Raising a marketing event with a valid split
      When Olivia the requester raises a marketing event "Platform Hackathon" funded 60% by "Consulting" and 40% by "Delivery"
      Then "Platform Hackathon" is raised with those two funding shares

    @negative
    Scenario: Refusing a split that does not sum to 100
      When Olivia the requester raises a marketing event "Platform Hackathon" funded 60% by "Consulting" and 30% by "Delivery"
      Then "Platform Hackathon" is not raised

  @story-F2.3
  Rule: Internal engagements and events are grouped by engagement code prefix

    Scenario: Grouping the internal list by prefix
      Given an internal engagement coded "RND-204" and a marketing event coded "MKT-110"
      When Olivia the requester opens the internal engagements list
      Then "RND-204" appears under "R&D" and "MKT-110" appears under "Marketing"

  @story-F2.4
  Rule: A requester edits an internal engagement or event

    Scenario: Editing a marketing event's dates
      Given a marketing event "Platform Hackathon" dated "2026-11-10" to "2026-11-12"
      When Olivia the requester edits "Platform Hackathon" to dates "2026-11-17" to "2026-11-19"
      Then "Platform Hackathon" is dated "2026-11-17" to "2026-11-19"

  @story-F2.5
  Rule: An internal engagement or event is completed, reopened or cancelled like a customer engagement

    Scenario: Completing an internal engagement request
      Given an internal engagement "INT-204" with request status "In Progress"
      When Olivia the requester marks "INT-204" completed
      Then "INT-204" has request status "Completed"

  @story-F2.1 @story-F2.2
  Rule: A new internal engagement or marketing event starts Pending Approval

    Scenario: A raised marketing event is listed for approval
      When Olivia the requester raises a marketing event "Platform Hackathon" funded 100% by "Consulting"
      Then "Platform Hackathon" has request status "Pending Approval"
      And "Platform Hackathon" appears in the approval queue
