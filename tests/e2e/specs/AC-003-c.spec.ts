// spec: tests/validation/test-plan.md § AC-003-c
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-003-c: an allocation request cannot be submitted against a Closed engagement", async ({ page }) => {
  // 1. Sign in as Account Manager
  await loginAs(page, "accountManager");

  // Setup: create a customer and an engagement, then close it
  await page.getByRole("button", { name: "New Customer" }).click();
  const customerName = `Closed Engagement Co ${Date.now()}`;
  await page.getByRole("textbox", { name: "Customer name" }).fill(customerName);
  await page.getByRole("textbox", { name: "Contact name" }).fill("Jane Doe");
  await page.getByRole("textbox", { name: "Contact email" }).fill("jane.doe@example.com");
  await page.getByRole("button", { name: "Create customer" }).click();
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();

  await page.getByRole("button", { name: "New Engagement" }).click();
  const engagementName = `Platform Migration ${Date.now()}`;
  await page.getByRole("textbox", { name: "Engagement name" }).fill(engagementName);
  await page.getByLabel(/Description/).fill("Migrate the customer's platform to the new stack.");
  await page.getByLabel("Start date").fill("2027-01-01");
  await page.getByLabel("End date").fill("2027-06-30");
  await page.getByPlaceholder("e.g. Developer").fill("Developer");
  await page.getByRole("button", { name: "Create engagement" }).click();
  await expect(page.getByRole("heading", { name: engagementName })).toBeVisible();

  // 2. Close the engagement
  await page.getByRole("button", { name: "Close Engagement" }).click();
  await expect(page.getByText("Closed", { exact: true })).toBeVisible();

  // 3. Attempt "Submit Allocation Request"
  // Assert: the app prevents submission — the action is disabled on a Closed engagement
  await expect(page.getByRole("button", { name: "Submit Allocation Request" })).toBeDisabled();
});
