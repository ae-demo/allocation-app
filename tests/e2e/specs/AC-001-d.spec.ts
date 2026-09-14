// spec: tests/validation/test-plan.md § AC-001-d
import { test, expect } from "@playwright/test";
import { loginAs } from "../lib/auth";

test("AC-001-d: any Account Manager can view the customers list", async ({ page }) => {
  // 1. Sign in as Account Manager (lands on /customers)
  await loginAs(page, "accountManager");

  // 2. The customers list loads: its table header is only rendered once the
  // list has successfully loaded (see Customers.tsx — the header sits inside
  // the same branch as the rows/empty-state, gated on a successful fetch).
  await expect(page.getByRole("columnheader", { name: "Customer" })).toBeVisible();
});
