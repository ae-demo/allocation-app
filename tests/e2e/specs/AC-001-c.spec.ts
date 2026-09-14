// spec: tests/validation/test-plan.md § AC-001-c
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-001-c: an Account Manager can edit a customer they created", async ({ page }) => {
  // 1. Sign in as Account Manager
  await loginAs(page, "accountManager");

  // 2. Open a customer (create one, then land on its detail page)
  await page.getByRole("button", { name: "New Customer" }).click();
  const customerName = `Edit Test Co ${Date.now()}`;
  await page.getByRole("textbox", { name: "Customer name" }).fill(customerName);
  await page.getByRole("textbox", { name: "Contact name" }).fill("Jane Doe");
  await page.getByRole("textbox", { name: "Contact email" }).fill("jane.doe@example.com");
  await page.getByRole("button", { name: "Create customer" }).click();
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();

  // 3. Change a field (the contact name) via an edit affordance on the detail page
  await page.getByRole("button", { name: "Edit" }).click();
  const updatedContactName = `Jane Doe (updated ${Date.now()})`;
  await page.getByRole("textbox", { name: "Contact name" }).fill(updatedContactName);

  // 4. Save
  await page.getByRole("button", { name: "Save" }).click();

  // Assert: the changed field is reflected
  await expect(page.getByText(updatedContactName)).toBeVisible();
});
