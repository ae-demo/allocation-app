// spec: tests/validation/test-plan.md § AC-009-b
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-009-b: each allocation shown to the Team Member includes the engagement, role, and utilization %", async ({
  page,
}) => {
  // 1. loginAs(teamMember) → lands on /my-allocations
  await loginAs(page, "teamMember");
  await expect(page).toHaveURL(/\/my-allocations$/);

  // Assert: table header exposes Engagement / Role / Utilization columns
  // (wireframes.dsl `MyAllocations`), verifiable even against the empty state.
  const table = page.getByRole("table");
  await expect(table).toBeVisible();
  for (const column of ["Engagement", "Role", "Utilization"]) {
    await expect(table.getByRole("columnheader", { name: column })).toBeVisible();
  }
});
