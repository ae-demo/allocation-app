Feature: F6 Dashboard

  @story-F6.1
  Rule: The dashboard shows allocations by engagement type and by allocation type, as charts with counts and percentages

    Scenario: Seeing today's allocation breakdown
      Given 3 active allocations on confirmed Paid engagements and 2 on confirmed internal engagements today
      When Fay the finance analyst opens the dashboard
      Then she sees the engagement-type chart showing 3 Paid and 2 Internal, with their percentages

  @story-F6.2
  Rule: The dashboard can be narrowed to one business unit and to a past date

    Scenario: Narrowing to a business unit
      Given "Consulting" has 2 active allocations today and "Delivery" has 1
      When Fay the finance analyst filters the dashboard to business unit "Consulting"
      Then the counts shown total 2, not 3

    Scenario: Viewing a past date
      Given "jane.doe@company.com" had a confirmed allocation covering "2026-09-15"
      When Fay the finance analyst views the dashboard as of "2026-09-15"
      Then the allocation for "jane.doe@company.com" is counted in that day's totals

  @negative
  Rule: The dashboard's past date can be at most yesterday

    Scenario: Refusing a future date
      When Fay the finance analyst tries to view the dashboard as of tomorrow's date
      Then the dashboard is not shown for a future date

  @negative
  Rule: The dashboard never counts team default allocations

    Scenario: A default allocation is excluded from today's counts
      Given "jane.doe@company.com" has only a team default allocation today, no engagement allocation
      When Fay the finance analyst opens the dashboard
      Then "jane.doe@company.com"'s default allocation is not counted
