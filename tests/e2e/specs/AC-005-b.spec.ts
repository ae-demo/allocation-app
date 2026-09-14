// spec: tests/validation/test-plan.md § AC-005-b
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-005-b: approving a request creates an allocation for the assigned team member", async ({ page }) => {
  // 1. loginAs(resourceManager) -> lands on /allocation-requests
  await loginAs(page, "resourceManager");
  // 2. Open a pending request's assign screen (first data row; row 0 is the header)
  const firstRequestRow = page.getByRole("row").nth(1);
  await expect(firstRequestRow).toBeVisible();
  await firstRequestRow.click();
  // 3. Select a team member, capturing their name so it can be looked up afterwards
  await page.getByRole("combobox", { name: "Team member" }).click();
  const option = page.getByRole("option").first();
  await expect(option).toBeVisible();
  const optionText = (await option.textContent())?.trim() ?? "";
  const teamMemberName = optionText.split("—")[0].trim();
  await option.click();
  // 4. Click "Approve & Assign"
  await page.getByRole("button", { name: "Approve & Assign" }).click();
  // Assert: a new allocation row for the assigned team member exists on the Allocations Overview
  await expect(page).toHaveURL(/\/allocations$/);
  await expect(page.getByRole("cell", { name: teamMemberName })).toBeVisible();
});
