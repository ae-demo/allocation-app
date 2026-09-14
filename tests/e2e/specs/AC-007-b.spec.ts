// spec: tests/validation/test-plan.md § AC-007-b
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-007-b: the allocations list shows each allocation's team member, engagement, role, utilization %, and dates", async ({
  page,
}) => {
  // 1. loginAs(resourceManager); 2. Navigate to "Allocations"
  await loginAs(page, "resourceManager");
  await page.getByRole("link", { name: "Allocations", exact: true }).click();
  await expect(page).toHaveURL(/\/allocations$/);

  // Assert: the table header exposes Team Member / Engagement / Role /
  // Utilization / Dates columns (wireframes.dsl `AllocationsOverview`).
  const table = page.getByRole("table");
  await expect(table).toBeVisible();
  for (const column of ["Team Member", "Engagement", "Role", "Utilization", "Dates"]) {
    await expect(table.getByRole("columnheader", { name: column })).toBeVisible();
  }
});
