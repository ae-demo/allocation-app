Feature: F9 Partner consultants

  @story-F9.1
  Rule: Partner consultants are listed with their key details

    Scenario: Seeing the partner consultants list
      Given a partner consultant "Alex Reed" of "Acme Partners" from "Singapore", status "Active"
      When Amara the administrator opens partner consultants
      Then she sees "Alex Reed" with partner "Acme Partners", country "Singapore" and status "Active"

  @story-F9.2
  Rule: An administrator adds a partner consultant

    Scenario: Adding a partner consultant with only the required fields
      When Amara the administrator adds a partner consultant "Priya Nair" of "Delta Staffing" from "India", status "Active"
      Then "Priya Nair" appears in the partner consultants list

  @story-F9.3
  Rule: An administrator edits a partner consultant, including marking them as having left

    Scenario: Marking a partner consultant as left
      Given a partner consultant "Priya Nair" with status "Active"
      When Amara the administrator sets "Priya Nair"'s status to "Left"
      Then "Priya Nair" has status "Left"

    @negative
    Scenario: A partner consultant with allocations on record cannot be deleted
      Given a partner consultant "Alex Reed" with an allocation on record
      When Amara the administrator tries to delete "Alex Reed"
      Then "Alex Reed" is not deleted, and is marked "Left" instead

  @negative
  Rule: Only Active partner consultants can be allocated

    Scenario: Refusing to allocate a Left partner consultant
      Given a partner consultant "Priya Nair" with status "Left"
      When Mark the allocation manager tries to allocate "Priya Nair" to an engagement
      Then "Priya Nair" is not allocated
