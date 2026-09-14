// spec: tests/validation/test-plan.md § AC-008-a
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-008-a: a Resource Manager can modify an allocation's role, utilization %, or date range", async ({ page }) => {
  // 1. loginAs(resourceManager); 2. Open an allocation's detail — the first
  // row of the allocations table.
  await loginAs(page, "resourceManager");
  await page.getByRole("link", { name: "Allocations", exact: true }).click();
  await expect(page).toHaveURL(/\/allocations$/);
  const table = page.getByRole("table");
  await expect(table).toBeVisible();
  await table.getByRole("row").nth(1).click();
  await expect(page).toHaveURL(/\/allocations\/.+/);

  // 3. Change utilization %; 4. Click "Save changes"
  await page.getByLabel("Utilization % — e.g. 100").fill("75");
  await page.getByRole("button", { name: "Save changes" }).click();

  // Assert: no forbidden alert; the change is reflected (AllocationDetail
  // shows a "Changes saved." success notice once the update succeeds).
  await expect(page.getByText("Changes saved.")).toBeVisible();
});
