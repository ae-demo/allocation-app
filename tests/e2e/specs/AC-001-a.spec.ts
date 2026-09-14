// spec: tests/validation/test-plan.md § AC-001-a
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-001-a: an Account Manager can create a customer with name and primary contact info", async ({ page }) => {
  // 1. Sign in as Account Manager (lands on /customers)
  await loginAs(page, "accountManager");

  // 2. Click "New Customer"
  await page.getByRole("button", { name: "New Customer" }).click();

  // 3. Fill Customer name / Contact name / Contact email (unique suffix)
  const customerName = `Acme Test Co ${Date.now()}`;
  await page.getByRole("textbox", { name: "Customer name" }).fill(customerName);
  await page.getByRole("textbox", { name: "Contact name" }).fill("Jane Doe");
  await page.getByRole("textbox", { name: "Contact email" }).fill("jane.doe@example.com");

  // 4. Click "Create customer"
  await page.getByRole("button", { name: "Create customer" }).click();

  // Assert: the created customer's name is visible (redirected to its detail page)
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();
});
