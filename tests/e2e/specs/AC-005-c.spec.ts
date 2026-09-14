// spec: tests/validation/test-plan.md § AC-005-c
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-005-c: an approved request's status changes to Approved", async ({ page }) => {
  // 1. loginAs(resourceManager) -> lands on /allocation-requests
  await loginAs(page, "resourceManager");
  // 2. Open a pending request's assign screen (first data row; row 0 is the header)
  const firstRequestRow = page.getByRole("row").nth(1);
  await expect(firstRequestRow).toBeVisible();
  await firstRequestRow.click();
  // 3. Select a team member and approve
  await page.getByRole("combobox", { name: "Team member" }).click();
  await page.getByRole("option").first().click();
  await page.getByRole("button", { name: "Approve & Assign" }).click();
  await expect(page).toHaveURL(/\/allocations$/);
  // 4. Re-open the requests list, filtered to Approved
  await page.getByRole("link", { name: "Allocation Requests" }).click();
  const statusFilter = page.getByRole("combobox", { name: /Status/ });
  await statusFilter.click();
  await page.getByRole("option", { name: "Approved" }).click();
  // Assert: status reads "Approved"
  await expect(page.getByText("Approved")).toBeVisible();
});
