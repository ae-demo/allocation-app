// spec: tests/validation/test-plan.md § AC-011-c
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";
import { target } from "../lib/targets";

test("AC-011-c: defining a staffing plan does not itself create any allocation", async ({ page, request }) => {
  // 1. Create an engagement with a staffing plan (AC-011-a's flow)
  await loginAs(page, "accountManager");

  await page.getByRole("button", { name: "New Customer" }).click();
  const customerName = `No Allocation Co ${Date.now()}`;
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

  const engagementId = new URL(page.url()).pathname.split("/").pop();

  // Read the signed-in session's access token (oidc-client-ts stores it in
  // localStorage) so the API request below is authenticated as this same user.
  const token = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.startsWith("oidc.user:"));
    if (!key) return null;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw).access_token as string) : null;
  });

  // 2. Query /api/allocations?engagementId=<id>
  const res = await request.get(`${target("allocation-api")}/allocations`, {
    params: { engagementId: engagementId ?? "" },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Assert: no allocation exists for that engagement from the staffing-plan action alone
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.data).toEqual([]);
});
