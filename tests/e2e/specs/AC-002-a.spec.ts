// spec: tests/validation/test-plan.md § AC-002-a
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-002-a: an Admin can add a team member to the directory", async ({ page }) => {
  // 1. loginAs(allocationAdmin) -> lands on /team-members
  await loginAs(page, "allocationAdmin");
  // 2. Click "Add Team Member"
  await page.getByRole("button", { name: "Add Team Member" }).click();
  // 3. Fill Name/Email/Title (unique suffix)
  const name = `E2E Team Member ${Date.now()}`;
  await page.getByRole("textbox", { name: "Name" }).fill(name);
  await page.getByRole("textbox", { name: "Email" }).fill(`e2e-team-member-${Date.now()}@example.com`);
  await page.getByRole("textbox", { name: "Title" }).fill("Developer");
  // 4. Click "Add team member"
  await page.getByRole("button", { name: "Add team member" }).click();
  // Assert: no "forbidden"/error alert, and the new team member appears in the directory
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText(name)).toBeVisible();
});
