Feature: F1 Customer engagements

  @story-F1.1
  Rule: A requester raises a customer engagement from a CRM opportunity and product

    Scenario: Raising a paid engagement from a CRM product
      Given "Acme Corp" has an opportunity "Platform Migration" with a line item "Migration Advisory"
      When Olivia the requester raises a Paid engagement for "Acme Corp" against "Migration Advisory"
      Then the engagement list for "Acme Corp" has one more engagement than before
      And its engagement code, dates and business unit come from "Migration Advisory"

  @story-F1.2
  Rule: The requester chooses one of five customer engagement types

    Scenario: Choosing Non-Paid Pre Sale
      Given "Acme Corp" has an opportunity "Platform Migration" with a line item "Migration Advisory"
      When Olivia the requester raises a Non-Paid Pre Sale engagement for "Acme Corp" against "Migration Advisory"
      Then the engagement's type is "Non-Paid Pre Sale"

  @story-F1.3
  Rule: A customer engagement records where and how the work happens

    Scenario: Recording on-site details
      Given "Acme Corp" has an opportunity "Platform Migration" with a line item "Migration Advisory"
      When Olivia the requester raises the engagement with country "Singapore", address "1 Raffles Place" and scope "Two-week on-site assessment"
      Then the engagement shows country "Singapore", address "1 Raffles Place" and scope "Two-week on-site assessment"

  @story-F1.4
  Rule: Every customer engagement appears in one filterable, searchable list

    Scenario: Filtering the engagement list by request status
      Given "Acme Corp" has an engagement "ENG-1021" with request status "New"
      And "Riverside Labs" has an engagement "ENG-1033" with request status "In Progress"
      When Olivia the requester filters the engagement list to request status "In Progress"
      Then the list shows "ENG-1033" and does not show "ENG-1021"

  @story-F1.5
  Rule: A paid engagement's dates can be refreshed from the CRM

    Scenario: Refreshing a paid engagement's dates
      Given a Paid engagement "ENG-1021" whose line item in the CRM now ends on "2027-03-01"
      When Olivia the requester fetches new dates for "ENG-1021"
      Then "ENG-1021" ends on "2027-03-01"

  @story-F1.6
  Rule: The requester completes or reopens an engagement request

    Scenario: Completing an engagement request
      Given an engagement "ENG-1021" with request status "In Progress"
      When Olivia the requester marks "ENG-1021" completed
      Then "ENG-1021" has request status "Completed"

    Scenario: Reopening a completed engagement request
      Given an engagement "ENG-1021" with request status "Completed"
      When Olivia the requester reopens "ENG-1021"
      Then "ENG-1021" has request status "In Progress"

  @story-F1.7
  Rule: Cancelling an engagement cancels every allocation on it

    Scenario: Cancelling an engagement with a confirmed allocation
      Given an engagement "ENG-1021" with a confirmed allocation for "jane.doe@company.com"
      When Olivia the requester sets "ENG-1021" to status "Cancelled"
      Then "ENG-1021" has engagement status "Cancelled"
      And the allocation for "jane.doe@company.com" on "ENG-1021" is "Allocation Cancelled"

  @story-F1.8
  Rule: The engagement list shows which consultants are allocated to each engagement

    Scenario: Seeing allocated consultants in the list
      Given an engagement "ENG-1021" with a confirmed allocation for "jane.doe@company.com"
      When Olivia the requester opens the engagement list
      Then the row for "ENG-1021" lists "jane.doe@company.com" among its consultants

  @story-F1.9
  Rule: The requester opens the engagement's CRM record from the form

    Scenario: Opening the CRM record for an engagement raised from a line item
      Given an engagement "ENG-1021" raised against the CRM line item "Migration Advisory"
      When Olivia the requester opens "ENG-1021" and follows "Go to CRM record"
      Then she is taken to the CRM record for "Migration Advisory"

  @negative
  Rule: A customer engagement's start date cannot be after its end date

    Scenario: Refusing an inverted date range
      Given "Acme Corp" has an opportunity "Platform Migration" with a line item "Migration Advisory"
      When Olivia the requester raises an engagement with start date "2026-12-01" and end date "2026-11-01"
      Then the engagement is not raised

  @story-F1.1 @negative
  Rule: A paid engagement cannot be raised twice for the same product

    Scenario: Refusing a second paid engagement for an already-requested product
      Given "Migration Advisory" already has a Paid engagement raised against it
      When Olivia the requester raises another Paid engagement against "Migration Advisory"
      Then no second engagement is raised for "Migration Advisory"
