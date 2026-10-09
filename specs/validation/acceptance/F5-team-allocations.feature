Feature: F5 Team allocations

  @story-F5.1
  Rule: A team manager sees a team's default allocations on a timeline for a date range

    Scenario: Viewing a team's timeline
      Given the "Consulting / Delivery / Platform" team has a default allocation for "jane.doe@company.com"
      When Tom the team manager opens the timeline for "Consulting / Delivery / Platform" from "2026-10-01" to "2026-12-31"
      Then he sees "jane.doe@company.com"'s default allocation on the timeline

  @story-F5.2
  Rule: A team manager adds a default allocation from the timeline

    Scenario: Adding a default allocation
      When Tom the team manager adds a default allocation for "jane.doe@company.com" of type "Bench" from "2026-10-01" to "2026-10-31"
      Then "jane.doe@company.com" has a default allocation of type "Bench" from "2026-10-01" to "2026-10-31"

  @story-F5.3
  Rule: A team manager updates or removes a default allocation from the timeline

    Scenario: Removing a recent default allocation
      Given "jane.doe@company.com" has a default allocation starting 5 days ago
      When Tom the team manager removes that default allocation
      Then "jane.doe@company.com" no longer has that default allocation

    @negative
    Scenario: Refusing to remove an old default allocation
      Given "jane.doe@company.com" has a default allocation starting 45 days ago
      When Tom the team manager tries to remove that default allocation
      Then "jane.doe@company.com" still has that default allocation

  @story-F5.4
  Rule: A team manager uploads a CSV of default allocations

    Scenario: Uploading a CSV with some invalid rows
      Given a CSV with one valid row for "jane.doe@company.com" and one row for an unknown username
      When Tom the team manager uploads the CSV
      Then he sees the unknown-username row listed as an error
      And he can submit the valid row and download the error file

    Scenario: Uploading a CSV where every row is valid
      Given a CSV with two valid rows
      When Tom the team manager uploads the CSV
      Then both rows are added as default allocations

  @negative
  Rule: A new default allocation is refused when the person already has another allocation in the period

    Scenario: Refusing an overlapping default allocation
      Given "jane.doe@company.com" already has an allocation from "2026-10-01" to "2026-10-31"
      When Tom the team manager tries to add a default allocation for "jane.doe@company.com" from "2026-10-15" to "2026-11-15"
      Then no new default allocation is added for "jane.doe@company.com"
