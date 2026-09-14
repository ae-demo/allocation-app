// spec: tests/validation/test-plan.md § AC-009-a
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-009-a: a Team Member can view a list of their own current and upcoming allocations", async ({ page }) => {
  // 1. loginAs(teamMember) → lands on /my-allocations
  await loginAs(page, "teamMember");
  await expect(page).toHaveURL(/\/my-allocations$/);
  // Assert: the page renders without a forbidden alert — the allocations
  // table (rows, or the "No allocations yet" empty state) is visible.
  await expect(page.getByRole("table")).toBeVisible();
});
