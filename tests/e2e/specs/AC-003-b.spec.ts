// spec: tests/validation/test-plan.md § AC-003-b
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-003-b: a submitted allocation request starts in Pending status", async ({ page }) => {
  // 1. Sign in as Account Manager
  await loginAs(page, "accountManager");

  // Setup: create a customer and an engagement (with a staffing plan role) to request against
  await page.getByRole("button", { name: "New Customer" }).click();
  const customerName = `Pending Status Co ${Date.now()}`;
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

  // Submit an allocation request (same flow as AC-003-a)
  await page.getByRole("button", { name: "Submit Allocation Request" }).click();
  await page.getByLabel("Utilization % — e.g. 100").fill("100");
  await page.getByLabel("Start date").fill("2027-02-01");
  await page.getByLabel("End date").fill("2027-05-31");
  await page.getByRole("button", { name: "Submit request" }).click();

  // Assert: the newly submitted request's status reads "Pending"
  await expect(page.getByText("Developer · 100% · Pending")).toBeVisible();
});
