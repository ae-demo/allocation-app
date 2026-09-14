// spec: tests/validation/test-plan.md § AC-004-b
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-004-b: a Resource Manager can view the details of a single allocation request", async ({ page }) => {
  // 1. loginAs(resourceManager) -> lands on /allocation-requests
  await loginAs(page, "resourceManager");
  // 2. From the list, open a request's detail/assign screen (first data row; row 0 is the header)
  const firstRequestRow = page.getByRole("row").nth(1);
  await expect(firstRequestRow).toBeVisible();
  await firstRequestRow.click();
  // Assert: request details (engagement, role, utilization %, dates) are visible, no forbidden alert
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Assign Team Member" })).toBeVisible();
  await expect(page.getByText(/·.*\d+%.*·/)).toBeVisible();
});
