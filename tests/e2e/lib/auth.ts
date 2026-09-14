import type { Page } from "@playwright/test";

// The four roles this project's Thunder tenant provisions test accounts for
// (specs/design/security.json `roles[]`). Credentials come only from the
// milestone's roles-gate ticket, exported in-session as these env vars —
// never hardcoded here or in any spec.
export type Role = "accountManager" | "resourceManager" | "allocationAdmin" | "teamMember";

const ENV_PREFIX: Record<Role, string> = {
  accountManager: "AM",
  resourceManager: "RM",
  allocationAdmin: "ADMIN",
  teamMember: "TM",
};

// The route each role lands on after a successful sign-in (each role's
// default/landing screen per specs/design/components/allocation-webapp/wireframes.dsl).
export const LANDING_PATH: Record<Role, string> = {
  accountManager: "/customers",
  resourceManager: "/allocation-requests",
  allocationAdmin: "/team-members",
  teamMember: "/my-allocations",
};

function credentials(role: Role): { username: string; password: string } {
  const prefix = ENV_PREFIX[role];
  const username = process.env[`AEP_E2E_${prefix}_USERNAME`];
  const password = process.env[`AEP_E2E_${prefix}_PASSWORD`];
  if (!username || !password) {
    throw new Error(
      `missing credentials for role "${role}": set AEP_E2E_${prefix}_USERNAME / AEP_E2E_${prefix}_PASSWORD`,
    );
  }
  return { username, password };
}

// Signs in through the real Thunder SSO gate (REQ-013): navigates to the app,
// which redirects to the IdP, fills the gate's username/password form, and
// waits for the redirect back to the app's role-specific landing screen.
export async function loginAs(page: Page, role: Role): Promise<void> {
  const { username, password } = credentials(role);
  await page.goto("/");
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => url.pathname.startsWith(LANDING_PATH[role]), { timeout: 15_000 });
}
