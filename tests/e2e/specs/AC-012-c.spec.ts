// spec: tests/validation/test-plan.md § AC-012-c
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-012-c: an Account Manager can reopen a Closed engagement to Active", async ({ page }) => {
  // 1. Sign in as Account Manager
  await loginAs(page, "accountManager");

  // Setup: create a customer and an engagement, then close it
  await page.getByRole("button", { name: "New Customer" }).click();
  const customerName = `Reopen Engagement Co ${Date.now()}`;
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
  await page.getByRole("button", { name: "Create engagement" }).click();
  await expect(page.getByRole("heading", { name: engagementName })).toBeVisible();

  await page.getByRole("button", { name: "Close Engagement" }).click();
  await expect(page.getByText("Closed", { exact: true })).toBeVisible();

  // 2. Click "Reopen"
  await page.getByRole("button", { name: "Reopen Engagement" }).click();

  // Assert: status becomes "Active"
  await expect(page.getByText("Active", { exact: true })).toBeVisible();
});
