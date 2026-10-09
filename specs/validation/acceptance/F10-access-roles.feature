Feature: F10 Access roles

  @story-F10.1
  Rule: An administrator picks a role, sees its privileges, and changes them

    Scenario: Granting a new privilege to a role
      Given the role "Approver" does not hold the "allocation-types:manage" privilege
      When Amara the administrator opens "Approver" and grants it "allocation-types:manage"
      Then "Approver" holds "allocation-types:manage"

    Scenario: Revoking a privilege from a role
      Given the role "Approver" holds the "reports:read" privilege
      When Amara the administrator opens "Approver" and revokes "reports:read"
      Then "Approver" no longer holds "reports:read"

  @story-F10.2
  Rule: An administrator adds a new role by naming a directory group

    Scenario: Adding a role for an existing directory group
      Given the directory has a group "Delivery Leads"
      When Amara the administrator types "Delivery Leads" to add it as a role
      Then "Delivery Leads" appears as a role with no privileges granted yet

  @negative
  Rule: Roles are never deleted or renamed

    Scenario: No control to delete a role
      Given the role "Approver" exists
      When Amara the administrator looks at "Approver"'s role settings
      Then she finds no option to delete or rename "Approver"
