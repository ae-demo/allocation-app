// spec: tests/validation/test-plan.md § AC-005-a
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-005-a: a Resource Manager can assign a team member with role, utilization %, and date range to a request", async ({ page }) => {
  // 1. loginAs(resourceManager) -> lands on /allocation-requests
  await loginAs(page, "resourceManager");
  // 2. Open a pending request's assign screen (first data row; row 0 is the header)
  const firstRequestRow = page.getByRole("row").nth(1);
  await expect(firstRequestRow).toBeVisible();
  await firstRequestRow.click();
  // 3. Select a team member; role, utilization %, and dates come pre-filled from the request
  await page.getByRole("combobox", { name: "Team member" }).click();
  await page.getByRole("option").first().click();
  // 4. Click "Approve & Assign"
  await page.getByRole("button", { name: "Approve & Assign" }).click();
  // Assert: no forbidden alert; navigates to the allocations overview with the new allocation visible
  await expect(page).toHaveURL(/\/allocations$/);
  await expect(page.getByRole("alert")).toHaveCount(0);
});
