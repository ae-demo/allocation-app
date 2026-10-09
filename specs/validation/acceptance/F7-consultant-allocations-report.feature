Feature: F7 Consultant allocations report

  @story-F7.1
  Rule: The report can be run for a period, for one consultant or for everyone, narrowed to allocation types

    Scenario: Running the report for one consultant
      Given "jane.doe@company.com" has allocations between "2026-10-01" and "2026-10-31"
      When Fay the finance analyst runs the report for "jane.doe@company.com" over that period
      Then the report shows only "jane.doe@company.com"'s allocations in that period

  @story-F7.2
  Rule: Each report row shows the allocation's engagement and cost details

    Scenario: Seeing the engagement group, account and GL code
      Given an allocation on engagement code "ENG-1021-A" whose code maps to account "Acme Corp" and GL code "GL-100"
      When Fay the finance analyst runs the report covering that allocation
      Then the row for it shows account "Acme Corp" and GL code "GL-100"

  @story-F7.3
  Rule: The report can be downloaded as a CSV file

    Scenario: Downloading the report
      Given a report has been run for "2026-10-01" to "2026-10-31"
      When Fay the finance analyst downloads it
      Then she receives a CSV file of the report's rows

  Rule: A person with no allocation in the period is reported on their team's default allocation

    Scenario: Reporting a team default for an unallocated period
      Given "jane.doe@company.com" has no engagement allocation between "2026-10-01" and "2026-10-31", only a team default allocation
      When Fay the finance analyst runs the report for "jane.doe@company.com" over that period
      Then the row for "jane.doe@company.com" shows her team's default allocation for the whole period

  @negative
  Rule: Working days exclude Saturdays and Sundays

    Scenario: A weekend-only allocation reports zero working days
      Given "jane.doe@company.com" has an allocation covering only "2026-10-03" and "2026-10-04", a Saturday and Sunday
      When Fay the finance analyst runs the report covering that allocation
      Then the row for it shows 0 working days

  @negative
  Rule: Allocations coded LEFT are left out of the report

    Scenario: A LEFT-coded allocation does not appear
      Given "jane.doe@company.com" has an allocation coded "LEFT" in "2026-10-01" to "2026-10-31"
      When Fay the finance analyst runs the report for "jane.doe@company.com" over that period
      Then no row for that allocation appears in the report
