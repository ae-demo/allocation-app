// Role resolution and screen visibility, per specs/design/security.json.
// The webapp holds no business logic — this module only decides which
// screens/nav items a signed-in user's groups entitle them to reach; every
// data-level permission (who may edit/close/reject what) is enforced by
// allocation-api and surfaces here only as an error the page renders.

export const ROLES = [
  "Team Member",
  "Account Manager",
  "Resource Manager",
  "Allocation Admin",
] as const;

export type Role = (typeof ROLES)[number];

// security.json coldStartRole: a freshly signed-in user with no elevated
// group reaches only My Allocations.
export const COLD_START_ROLE: Role = "Team Member";

/** Match `user.profile.groups` against security.json's role names. */
export function resolveRoles(groups: string[]): Role[] {
  const matched = ROLES.filter((role) =>
    groups.some((g) => g.trim().toLowerCase() === role.toLowerCase()),
  );
  return matched.length > 0 ? matched : [COLD_START_ROLE];
}

export type ScreenKey =
  | "Customers"
  | "AllocationRequests"
  | "AllocationsOverview"
  | "TeamMembers"
  | "UtilizationReport"
  | "MyAllocations";

// security.json permissions[].screens, plus the task's explicit "every
// signed-in user reaches My Allocations" (a person holding any role can also
// check their own allocations).
const SCREENS_BY_ROLE: Record<Role, ScreenKey[]> = {
  "Team Member": ["MyAllocations"],
  "Account Manager": ["Customers", "MyAllocations"],
  "Resource Manager": ["AllocationRequests", "AllocationsOverview", "MyAllocations"],
  "Allocation Admin": ["TeamMembers", "UtilizationReport", "MyAllocations"],
};

export function canReach(roles: Role[], screen: ScreenKey): boolean {
  return roles.some((role) => SCREENS_BY_ROLE[role].includes(screen));
}

// Landing screen priority when a user holds more than one role — the order
// the wireframes.dsl flows are declared in (Account Manager, Resource
// Manager, Allocation Admin, Team Member).
const LANDING_PATH_BY_ROLE: Record<Role, string> = {
  "Account Manager": "/customers",
  "Resource Manager": "/allocation-requests",
  "Allocation Admin": "/team-members",
  "Team Member": "/my-allocations",
};

const LANDING_PRIORITY: Role[] = [
  "Account Manager",
  "Resource Manager",
  "Allocation Admin",
  "Team Member",
];

export function landingPath(roles: Role[]): string {
  for (const role of LANDING_PRIORITY) {
    if (roles.includes(role)) return LANDING_PATH_BY_ROLE[role];
  }
  return "/my-allocations";
}
