// spec: tests/validation/test-plan.md § AC-001-b
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-001-b: an Account Manager can create an engagement under a customer with name, description, and date range", async ({
  page,
}) => {
  // 1. Sign in as Account Manager
  await loginAs(page, "accountManager");

  // 2. Create a customer to attach the engagement to
  await page.getByRole("button", { name: "New Customer" }).click();
  const customerName = `Engagement Parent Co ${Date.now()}`;
  await page.getByRole("textbox", { name: "Customer name" }).fill(customerName);
  await page.getByRole("textbox", { name: "Contact name" }).fill("Jane Doe");
  await page.getByRole("textbox", { name: "Contact email" }).fill("jane.doe@example.com");
  await page.getByRole("button", { name: "Create customer" }).click();
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();

  // 3. Click "New Engagement"
  await page.getByRole("button", { name: "New Engagement" }).click();

  // 4. Fill name, description, start/end dates
  const engagementName = `Platform Migration ${Date.now()}`;
  await page.getByRole("textbox", { name: "Engagement name" }).fill(engagementName);
  await page.getByLabel(/Description/).fill("Migrate the customer's platform to the new stack.");
  await page.getByLabel("Start date").fill("2027-01-01");
  await page.getByLabel("End date").fill("2027-06-30");

  // 5. Click "Create engagement"
  await page.getByRole("button", { name: "Create engagement" }).click();

  // Assert: the engagement was created (its detail page shows the name we gave it)
  await expect(page.getByRole("heading", { name: engagementName })).toBeVisible();
});
