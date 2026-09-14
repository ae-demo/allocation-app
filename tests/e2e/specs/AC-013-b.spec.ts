// spec: tests/validation/test-plan.md § AC-013-b
import { test, expect } from "@playwright/test";
import { loginAs, type Role } from "../lib/auth";

// Client-side nav filtering, driven by the Thunder ID token's `groups`
// claim: it renders before/independent of allocation-api, so this is
// unaffected by the API outage described in test-plan.md.
const EXPECTED_LINKS: Record<Role, string[]> = {
  accountManager: ["Customers", "My Allocations"],
  resourceManager: ["Allocation Requests", "Allocations", "My Allocations"],
  allocationAdmin: ["Team Members", "Utilization", "My Allocations"],
  teamMember: ["My Allocations"],
};

for (const role of Object.keys(EXPECTED_LINKS) as Role[]) {
  test(`AC-013-b: a signed-in ${role} only sees the screens and actions permitted by their role`, async ({
    page,
  }) => {
    await loginAs(page, role);
    const nav = page.getByRole("navigation");
    const expected = EXPECTED_LINKS[role];
    for (const name of expected) {
      await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole("link")).toHaveCount(expected.length);
  });
}
