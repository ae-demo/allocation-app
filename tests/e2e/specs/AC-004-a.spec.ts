// spec: tests/validation/test-plan.md § AC-004-a
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-004-a: a Resource Manager can view a list of pending allocation requests", async ({ page }) => {
  // 1. loginAs(resourceManager) -> lands on /allocation-requests
  await loginAs(page, "resourceManager");
  // Assert: the list renders (rows or an explicit empty state), no forbidden alert
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText("Engagement", { exact: true }).or(page.getByText("No allocation requests"))).toBeVisible();
});
