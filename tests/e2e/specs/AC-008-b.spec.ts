// spec: tests/validation/test-plan.md § AC-008-b
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-008-b: a Resource Manager can end an allocation before its original end date", async ({ page }) => {
  // 1. loginAs(resourceManager); 2. Open an allocation's detail — the first
  // row of the allocations table.
  await loginAs(page, "resourceManager");
  await page.getByRole("link", { name: "Allocations", exact: true }).click();
  await expect(page).toHaveURL(/\/allocations$/);
  const table = page.getByRole("table");
  await expect(table).toBeVisible();
  await table.getByRole("row").nth(1).click();
  await expect(page).toHaveURL(/\/allocations\/.+/);
  const heading = (await page.getByRole("heading", { level: 1 }).textContent()) ?? "";

  // 3. Click "End Allocation"
  await page.getByRole("button", { name: "End Allocation" }).click();

  // Assert: no forbidden alert; status becomes "Ended" for that allocation on
  // the overview.
  await expect(page).toHaveURL(/\/allocations$/);
  await expect(table.getByRole("row").filter({ hasText: heading })).toContainText("Ended");
});
