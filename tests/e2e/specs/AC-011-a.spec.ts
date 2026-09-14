// spec: tests/validation/test-plan.md § AC-011-a
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-011-a: an Account Manager can add a role with a target headcount to an engagement's staffing plan", async ({
  page,
}) => {
  // 1. Sign in as Account Manager
  await loginAs(page, "accountManager");

  // 2. Create a customer, then open "New Engagement"
  await page.getByRole("button", { name: "New Customer" }).click();
  const customerName = `Staffing Plan Co ${Date.now()}`;
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

  // 3. Click "Add role", fill role + target headcount
  await page.getByRole("button", { name: "Add role" }).click();
  await page.getByPlaceholder("e.g. Developer").last().fill("Tech Lead");
  await page.getByRole("spinbutton").last().fill("3");

  // 4. Save/Create
  await page.getByRole("button", { name: "Create engagement" }).click();

  // Assert: the staffing plan line appears on the created engagement
  await expect(page.getByRole("heading", { name: engagementName })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Tech Lead" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "3" })).toBeVisible();
});
