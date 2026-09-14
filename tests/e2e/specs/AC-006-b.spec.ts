// spec: tests/validation/test-plan.md § AC-006-b
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-006-b: a rejected request's status changes to Rejected and stores the reason", async ({ page }) => {
  // 1. loginAs(resourceManager) -> lands on /allocation-requests
  await loginAs(page, "resourceManager");
  // 2. Open a pending request (first data row; row 0 is the header)
  const firstRequestRow = page.getByRole("row").nth(1);
  await expect(firstRequestRow).toBeVisible();
  await firstRequestRow.click();
  // 3. Reject it with a reason (unique suffix)
  await page.getByRole("button", { name: "Reject" }).click();
  const reason = `No capacity — e2e ${Date.now()}`;
  await page.getByRole("textbox", { name: "Reason for rejection" }).fill(reason);
  await page.getByRole("button", { name: "Reject request" }).click();
  await expect(page).toHaveURL(/\/allocation-requests$/);
  // 4. Re-open the requests list, filtered to Rejected
  const statusFilter = page.getByRole("combobox", { name: /Status/ });
  await statusFilter.click();
  await page.getByRole("option", { name: "Rejected" }).click();
  // Assert: status reads "Rejected" and the reason text is shown
  await expect(page.getByText("Rejected")).toBeVisible();
  await expect(page.getByText(reason)).toBeVisible();
});
