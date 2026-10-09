Feature: F8 Allocation types

  @story-F8.1
  Rule: Active allocation types are listed with their key fields

    Scenario: Seeing the allocation types list
      Given an active allocation type "Billable" under engagement type "Paid"
      When Amara the administrator opens allocation types
      Then she sees "Billable" with its engagement type, department, colour, default code, suffix and notify setting

  @story-F8.2
  Rule: An allocation type is added under an active engagement type

    Scenario: Adding an allocation type
      Given the engagement type "Paid" is active
      When Amara the administrator adds an allocation type "Premium" under "Paid" with default code "PREM"
      Then "Premium" appears in the allocation types list

    @negative
    Scenario: Refusing an allocation type under an inactive engagement type
      Given the engagement type "Legacy Paid" is inactive
      When Amara the administrator tries to add an allocation type under "Legacy Paid"
      Then no allocation type is added under "Legacy Paid"

  @story-F8.3
  Rule: An administrator edits or deletes an allocation type

    Scenario: Editing an allocation type's notify setting
      Given an allocation type "Billable" with "Notify to Allocations" set to "Yes"
      When Amara the administrator sets "Billable"'s "Notify to Allocations" to "No"
      Then "Billable" has "Notify to Allocations" set to "No"

    Scenario: Deleting an allocation type
      Given an allocation type "Premium" with no engagements or allocations using it
      When Amara the administrator deletes "Premium"
      Then "Premium" no longer appears in the allocation types list
