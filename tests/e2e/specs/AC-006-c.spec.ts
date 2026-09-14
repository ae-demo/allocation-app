// spec: tests/validation/test-plan.md § AC-006-c
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-006-c: the requesting Account Manager can see the rejection reason on the request", async ({ browser }) => {
  // Setup: reject a pending request as the Resource Manager (AC-006-a's flow), capturing
  // which engagement/role it was for and the reason text, so the Account Manager can look
  // it up afterwards. Uses a separate browser context so the two role sessions don't collide.
  const rmContext = await browser.newContext();
  const rmPage = await rmContext.newPage();
  await loginAs(rmPage, "resourceManager");
  const firstRequestRow = rmPage.getByRole("row").nth(1);
  await expect(firstRequestRow).toBeVisible();
  await firstRequestRow.click();
  const engagementAndRole = (await rmPage.getByText(/·/).first().textContent())?.trim() ?? "";
  const engagementName = engagementAndRole.split("·")[0].trim();
  await rmPage.getByRole("button", { name: "Reject" }).click();
  const reason = `No capacity — e2e ${Date.now()}`;
  await rmPage.getByRole("textbox", { name: "Reason for rejection" }).fill(reason);
  await rmPage.getByRole("button", { name: "Reject request" }).click();
  await expect(rmPage).toHaveURL(/\/allocation-requests$/);
  await rmContext.close();

  // 1. loginAs(accountManager)
  const amContext = await browser.newContext();
  const amPage = await amContext.newPage();
  await loginAs(amPage, "accountManager");
  // 2. Open the engagement whose request was rejected
  await amPage.getByRole("row").nth(1).click();
  await amPage.getByRole("row", { name: new RegExp(engagementName) }).click();
  // Assert: the rejection reason text is visible next to the request
  await expect(amPage.getByText(reason)).toBeVisible();
  await amContext.close();
});
