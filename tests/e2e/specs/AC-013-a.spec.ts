// spec: tests/validation/test-plan.md § AC-013-a
import { test, expect } from "@playwright/test";

test("AC-013-a: an unauthenticated user is redirected to sign in before reaching any role's screens", async ({
  page,
}) => {
  // 1. Navigate directly to a role-gated screen with no prior session
  await page.goto("/customers");
  // 2. The browser ends up on the Thunder sign-in gate, not an app screen
  await page.waitForURL((url) => url.pathname === "/gate/signin", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
});
