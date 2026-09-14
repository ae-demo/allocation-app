// spec: tests/validation/test-plan.md § AC-002-c
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-002-c: a Resource Manager can view the team member directory when assigning staff", async ({ page }) => {
  // 1. loginAs(resourceManager) -> lands on /allocation-requests
  await loginAs(page, "resourceManager");
  // 2. Navigate to the assign-team-member flow from a pending request (first data row; row 0 is the header)
  const firstRequestRow = page.getByRole("row").nth(1);
  await expect(firstRequestRow).toBeVisible();
  await firstRequestRow.click();
  // Assert: team member names are visible in the picker/list, no forbidden alert
  await expect(page.getByRole("alert")).toHaveCount(0);
  const teamMemberPicker = page.getByRole("combobox", { name: "Team member" });
  await expect(teamMemberPicker).toBeVisible();
  await teamMemberPicker.click();
  await expect(page.getByRole("option").first()).toBeVisible();
});
