Feature: F4 Consultant allocations

  @story-F4.1
  Rule: An allocation manager opens an engagement's allocation workspace

    Scenario: Opening the workspace shows the engagement and its allocations
      Given an engagement "ENG-1021" with a confirmed allocation for "jane.doe@company.com"
      When Mark the allocation manager opens the allocation workspace for "ENG-1021"
      Then he sees "ENG-1021"'s details and "jane.doe@company.com" on the timeline

  @story-F4.2
  Rule: The allocation manager finds a staff member by email or by team

    Scenario: Finding a staff member by email
      Given "jane.doe@company.com" is a known employee
      When Mark the allocation manager searches for "jane.doe@company.com"
      Then "jane.doe@company.com" appears in the search results with her existing allocations

  @story-F4.3
  Rule: The allocation manager allocates a partner consultant from an active partner company

    Scenario: Allocating an active partner consultant
      Given "Alex Reed" is an Active partner consultant of "Acme Partners"
      When Mark the allocation manager allocates "Alex Reed" to "ENG-1021"
      Then "Alex Reed" is allocated to "ENG-1021" with clearance status "Confirmed"

    @negative
    Scenario: A left partner consultant cannot be allocated
      Given "Priya Nair" is a Left partner consultant of "Delta Staffing"
      When Mark the allocation manager tries to allocate "Priya Nair" to "ENG-1021"
      Then "Priya Nair" is not allocated to "ENG-1021"

  @story-F4.4
  Rule: An allocation records its type, dates, clearance status and travel requirement

    Scenario: Recording an hourly recurring allocation
      When Mark the allocation manager allocates "jane.doe@company.com" to "ENG-1021" hourly from "09:00" to "13:00" in "Asia/Colombo", recurring
      Then the allocation for "jane.doe@company.com" on "ENG-1021" is hourly, "09:00" to "13:00", recurring

  @story-F4.5
  Rule: Preparation and post-engagement overhead time can be added around a paid allocation

    Scenario: Adding preparation overhead
      Given a Paid engagement "ENG-1021" allocation for "jane.doe@company.com" starting "2026-11-01"
      When Mark the allocation manager adds 3 days of preparation overhead before it
      Then "jane.doe@company.com" has an Engagement Overhead allocation ending before "2026-11-01"

  @story-F4.6
  Rule: An allocation moves through clearance along defined paths only

    Scenario: Moving Ready for Clearance to Clearance In Progress
      Given an allocation for "jane.doe@company.com" on "ENG-1021" that is "Ready for Clearance"
      When Mark the allocation manager moves it to "Clearance In Progress"
      Then the allocation is "Clearance In Progress"

    @negative
    Scenario: Refusing an invalid clearance transition
      Given an allocation for "jane.doe@company.com" on "ENG-1021" that is "Ready for Clearance"
      When Mark the allocation manager tries to move it straight to "Confirmed - Visa Pending"
      Then the allocation is still "Ready for Clearance"

  @story-F4.7
  Rule: Every engagement allocation appears in one filterable, searchable list

    Scenario: Filtering allocations by clearance status
      Given "ENG-1021" has an allocation for "jane.doe@company.com" that is "Confirmed"
      And "ENG-1033" has an allocation for "john.smith@company.com" that is "Clearance In Progress"
      When Mark the allocation manager filters the allocation list to clearance status "Confirmed"
      Then the list shows "jane.doe@company.com" and does not show "john.smith@company.com"

  @story-F4.8
  Rule: The allocation manager searches the skills register for consultants matching a scope

    Scenario: Searching consultants by suggested skills
      Given the engagement scope "Platform migration advisory using Kubernetes" suggests the skill "Kubernetes"
      When Mark the allocation manager accepts the suggested skill and searches
      Then the results include consultants whose skills include "Kubernetes"

  @story-F4.9
  Rule: The allocation manager completes or reopens the engagement request from the workspace

    Scenario: Completing the request from the allocation workspace
      Given an engagement "ENG-1021" with request status "In Progress"
      When Mark the allocation manager marks "ENG-1021" completed from the allocation workspace
      Then "ENG-1021" has request status "Completed"

  @negative
  Rule: A consultant cannot be allocated while another live allocation covers the period

    Scenario: Refusing an overlapping allocation
      Given "jane.doe@company.com" already has a live allocation from "2026-11-01" to "2027-02-01"
      When Mark the allocation manager tries to allocate "jane.doe@company.com" to another engagement from "2026-12-01" to "2026-12-15"
      Then the second allocation is not created
