// spec: tests/validation/test-plan.md § AC-011-b
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-011-b: an Account Manager can revise an engagement's staffing plan at any time", async ({ page }) => {
  // 1. Sign in as Account Manager
  await loginAs(page, "accountManager");

  // Setup: create a customer and an engagement with an initial staffing plan line
  await page.getByRole("button", { name: "New Customer" }).click();
  const customerName = `Revise Plan Co ${Date.now()}`;
  await page.getByRole("textbox", { name: "Customer name" }).fill(customerName);
  await page.getByRole("textbox", { name: "Contact name" }).fill("Jane Doe");
  await page.getByRole("textbox", { name: "Contact email" }).fill("jane.doe@example.com");
  await page.getByRole("button", { name: "Create customer" }).click();
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();

  await page.getByRole("button", { name: "New Engagement" }).click();
  const engagementName = `Platform Migration ${Date.now()}`;
  await page.getByRole("textbox", { name: "Engagement name" }).fill(engagementName);
  await page.getByLabel("Start date").fill("2027-01-01");
  await page.getByLabel("End date").fill("2027-06-30");
  await page.getByPlaceholder("e.g. Developer").fill("Developer");
  await page.getByRole("spinbutton").first().fill("2");
  await page.getByRole("button", { name: "Create engagement" }).click();
  await expect(page.getByRole("heading", { name: engagementName })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Developer" })).toBeVisible();

  // 2. Open the existing engagement's staffing plan for revision
  await page.getByRole("button", { name: "Edit staffing plan" }).click();

  // 3. Change a staffing plan line's target headcount
  await page.getByRole("spinbutton").first().fill("5");

  // 4. Save
  await page.getByRole("button", { name: "Save" }).click();

  // Assert: the revised value is reflected
  await expect(page.getByRole("cell", { name: "5" })).toBeVisible();
});
