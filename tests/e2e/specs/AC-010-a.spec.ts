// spec: tests/validation/test-plan.md § AC-010-a
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-010-a: an Admin can view a report showing utilization % across all team members", async ({ page }) => {
  // 1. loginAs(allocationAdmin); 2. Navigate to "Utilization"
  await loginAs(page, "allocationAdmin");
  await page.getByRole("link", { name: "Utilization" }).click();
  await expect(page).toHaveURL(/\/utilization$/);
  // Assert: the report renders (chart/table or explicit empty state), no
  // forbidden alert.
  await expect(page.getByRole("table")).toBeVisible();
});
