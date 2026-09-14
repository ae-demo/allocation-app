// spec: tests/validation/test-plan.md § AC-009-c
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";
import { target } from "../lib/targets";

test("AC-009-c: a Team Member cannot view another team member's allocations", async ({ page, request }) => {
  // The API is observed to take up to ~15s per authenticated call before
  // responding (see test-plan.md's 2026-09-14 update) — on top of a real
  // Thunder SSO login, that can exceed the 30s default. Widen only this
  // test's budget so the real response (whatever it is) is observed instead
  // of the run being cut off mid-request; no assertion below changes.
  test.setTimeout(60_000);

  // 1. loginAs(teamMember), capture the session's bearer token (the same
  // token the webapp attaches as `Authorization: Bearer <token>` — see
  // allocation-webapp/src/api.ts).
  await loginAs(page, "teamMember");
  const raw = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.startsWith("oidc.user:"));
    return key ? localStorage.getItem(key) : null;
  });
  const token = raw ? (JSON.parse(raw) as { access_token?: string }).access_token : null;
  expect(token, "expected an access token in localStorage after sign-in").toBeTruthy();

  // 2. Via the request fixture, request another team member's allocations.
  const otherTeamMemberId = "not-the-caller";
  const res = await request.get(`${target("allocation-api")}/allocations?teamMemberId=${otherTeamMemberId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Assert: the response does not return another team member's allocations —
  // openapi documents `teamMemberId` as "defaults to caller when they are a
  // Team Member", so a Team Member's request is either rejected (403) or
  // silently scoped to themself (200, with no data for the other id).
  if (res.status() === 200) {
    const body = (await res.json()) as { data: Array<{ teamMemberId: string }> };
    expect(body.data.some((a) => a.teamMemberId === otherTeamMemberId)).toBe(false);
  } else {
    expect(res.status()).toBe(403);
  }
});
