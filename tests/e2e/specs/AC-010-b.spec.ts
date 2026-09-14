// spec: tests/validation/test-plan.md § AC-010-b
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";
import { target } from "../lib/targets";

test("AC-010-b: the report reflects the sum of a team member's active allocation utilization %", async ({
  page,
  request,
}) => {
  // The API is observed to take up to ~15s per authenticated call before
  // responding (see test-plan.md's 2026-09-14 update), and this test makes
  // two such calls in sequence on top of a real Thunder SSO login — widen
  // only this test's budget so the real responses are observed instead of
  // the run being cut off mid-request; no assertion below changes.
  test.setTimeout(60_000);

  // 1. loginAs(allocationAdmin); 2. Navigate to "Utilization"
  await loginAs(page, "allocationAdmin");
  await page.getByRole("link", { name: "Utilization" }).click();
  await expect(page).toHaveURL(/\/utilization$/);

  const raw = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.startsWith("oidc.user:"));
    return key ? localStorage.getItem(key) : null;
  });
  const token = raw ? (JSON.parse(raw) as { access_token?: string }).access_token : null;
  expect(token, "expected an access token in localStorage after sign-in").toBeTruthy();
  const headers = { Authorization: `Bearer ${token}` };

  // Independently compute, from the API, what the report's total for one
  // team member must be: the sum of that member's Active allocations'
  // utilizationPct (TeamMemberUtilization schema).
  const reportRes = await request.get(`${target("allocation-api")}/reports/utilization`, { headers });
  expect(reportRes.status()).toBe(200);
  const report = (await reportRes.json()) as {
    data: Array<{ teamMemberId: string; name: string; totalUtilizationPct: number }>;
  };
  expect(report.data.length).toBeGreaterThan(0);
  const sample = report.data[0];

  const allocationsRes = await request.get(
    `${target("allocation-api")}/allocations?teamMemberId=${sample.teamMemberId}&limit=200`,
    { headers },
  );
  expect(allocationsRes.status()).toBe(200);
  const allocations = (await allocationsRes.json()) as { data: Array<{ status: string; utilizationPct: number }> };
  const expectedSum = allocations.data
    .filter((a) => a.status === "Active")
    .reduce((sum, a) => sum + a.utilizationPct, 0);

  // Assert: the report's total for this team member equals the sum computed
  // independently above, and the same value is what the report screen shows.
  expect(sample.totalUtilizationPct).toBe(expectedSum);
  await expect(page.getByRole("row").filter({ hasText: sample.name })).toContainText(`${sample.totalUtilizationPct}%`);
});
