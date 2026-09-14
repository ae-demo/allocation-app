// spec: tests/validation/test-plan.md § AC-006-a
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-006-a: a Resource Manager can reject a pending allocation request with a reason", async ({ page }) => {
  // 1. loginAs(resourceManager) -> lands on /allocation-requests
  await loginAs(page, "resourceManager");
  // 2. Open a pending request (first data row; row 0 is the header)
  const firstRequestRow = page.getByRole("row").nth(1);
  await expect(firstRequestRow).toBeVisible();
  await firstRequestRow.click();
  // 3. Click "Reject"
  await page.getByRole("button", { name: "Reject" }).click();
  // 4. Fill reason (unique suffix)
  const reason = `No capacity — e2e ${Date.now()}`;
  await page.getByRole("textbox", { name: "Reason for rejection" }).fill(reason);
  // 5. Click "Reject request"
  await page.getByRole("button", { name: "Reject request" }).click();
  // Assert: no forbidden alert; navigates back to the requests list
  await expect(page).toHaveURL(/\/allocation-requests$/);
  await expect(page.getByRole("alert")).toHaveCount(0);
});
