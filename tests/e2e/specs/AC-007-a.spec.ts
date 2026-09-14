// spec: tests/validation/test-plan.md § AC-007-a
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-007-a: a Resource Manager can view a list of all current and upcoming allocations across engagements", async ({
  page,
}) => {
  // 1. loginAs(resourceManager) → lands on /allocation-requests
  await loginAs(page, "resourceManager");
  // 2. Navigate to "Allocations"
  await page.getByRole("link", { name: "Allocations", exact: true }).click();
  await expect(page).toHaveURL(/\/allocations$/);
  // Assert: the allocations list renders (its table of allocations), not stuck
  // behind a load error.
  await expect(page.getByRole("table")).toBeVisible();
});
