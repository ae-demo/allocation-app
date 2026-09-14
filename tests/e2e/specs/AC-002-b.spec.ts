// spec: tests/validation/test-plan.md § AC-002-b
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-002-b: an Admin can edit a team member's directory record", async ({ page }) => {
  // 1. loginAs(allocationAdmin) -> lands on /team-members
  await loginAs(page, "allocationAdmin");
  // 2. Open a team member record from the directory (first data row; row 0 is the header)
  const firstRow = page.getByRole("row").nth(1);
  await expect(firstRow).toBeVisible();
  await firstRow.click();
  // 3. Change a field
  const newTitle = `Staff Engineer ${Date.now()}`;
  await page.getByRole("textbox", { name: "Title" }).fill(newTitle);
  // 4. Save
  await page.getByRole("button", { name: /save/i }).click();
  // Assert: no "forbidden"/error alert; the changed field is reflected
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText(newTitle)).toBeVisible();
});
