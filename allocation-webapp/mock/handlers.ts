// Mock mode's API half — one handler per operation in allocation-api's
// committed openapi.yaml, served through MSW. State lives in this module's
// scope, so it behaves like a real app (a create shows up in the next list, a
// reject persists) for as long as the SPA keeps navigating in-app; any full
// page load re-runs this module and resets the seed data below.

import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/allocation-api";
import { rolesFromToken } from "./auth";

type Customer = components["schemas"]["Customer"];
type Engagement = components["schemas"]["Engagement"];
type TeamMember = components["schemas"]["TeamMember"];
type AllocationRequest = components["schemas"]["AllocationRequest"];
type Allocation = components["schemas"]["Allocation"];

let nextId = 100;
const freshId = (prefix: string) => `${prefix}${nextId++}`;

let customers: Customer[] = [
  { id: "c1", name: "Acme Corp", contactName: "J. Rivera", contactEmail: "j.rivera@acme.example", contactPhone: "+1-555-0101" },
  { id: "c2", name: "Globex Inc", contactName: "S. Patel", contactEmail: "s.patel@globex.example", contactPhone: "+1-555-0102" },
  { id: "c3", name: "Initech", contactName: "D. Wu", contactEmail: "d.wu@initech.example", contactPhone: "+1-555-0103" },
];

let engagements: Engagement[] = [
  {
    id: "e1",
    customerId: "c1",
    name: "Platform Migration",
    description: "Migrate Acme's platform to the new stack.",
    startDate: "2027-01-01",
    endDate: "2027-06-30",
    status: "Active",
    staffingPlan: [
      { role: "Developer", targetHeadcount: 2 },
      { role: "Tech Lead", targetHeadcount: 1 },
    ],
  },
  {
    id: "e2",
    customerId: "c1",
    name: "Support Retainer",
    description: "Ongoing support retainer.",
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    status: "Active",
    staffingPlan: [{ role: "Tech Lead", targetHeadcount: 1 }],
  },
  {
    id: "e3",
    customerId: "c1",
    name: "Q3 Audit",
    description: "Quarterly compliance audit.",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    status: "Closed",
    staffingPlan: [{ role: "Tech Lead", targetHeadcount: 1 }],
  },
  {
    id: "e4",
    customerId: "c2",
    name: "Globex Engagement",
    description: "Globex integration work.",
    startDate: "2027-01-01",
    endDate: "2027-12-31",
    status: "Active",
    staffingPlan: [{ role: "Tech Lead", targetHeadcount: 1 }],
  },
  {
    id: "e5",
    customerId: "c3",
    name: "Initech Engagement A",
    description: "Completed engagement.",
    startDate: "2025-01-01",
    endDate: "2025-06-30",
    status: "Closed",
    staffingPlan: [],
  },
  {
    id: "e6",
    customerId: "c3",
    name: "Initech Engagement B",
    description: "Completed engagement.",
    startDate: "2025-07-01",
    endDate: "2025-12-31",
    status: "Closed",
    staffingPlan: [],
  },
];

let teamMembers: TeamMember[] = [
  { id: "tm1", name: "A. Chen", email: "a.chen@example.com", title: "Developer" },
  { id: "tm2", name: "M. Diaz", email: "m.diaz@example.com", title: "Tech Lead" },
  { id: "tm3", name: "S. Okafor", email: "s.okafor@example.com", title: "Developer" },
];

let allocationRequests: AllocationRequest[] = [
  { id: "r1", engagementId: "e1", role: "Developer", utilizationPct: 100, startDate: "2027-02-01", endDate: "2027-05-31", status: "Pending" },
  {
    id: "r2",
    engagementId: "e2",
    role: "Tech Lead",
    utilizationPct: 50,
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    status: "Rejected",
    rejectionReason: "no capacity",
  },
];

let allocations: Allocation[] = [
  { id: "a1", allocationRequestId: "r1", engagementId: "e1", teamMemberId: "tm1", role: "Developer", utilizationPct: 100, startDate: "2027-02-01", endDate: "2027-05-31", status: "Active" },
  { id: "a2", engagementId: "e2", teamMemberId: "tm1", role: "Developer", utilizationPct: 50, startDate: "2026-01-01", endDate: "2027-12-31", status: "Active" },
  { id: "a3", engagementId: "e3", teamMemberId: "tm2", role: "Tech Lead", utilizationPct: 100, startDate: "2026-07-01", endDate: "2026-09-30", status: "Ended" },
  { id: "a4", engagementId: "e4", teamMemberId: "tm2", role: "Tech Lead", utilizationPct: 100, startDate: "2027-01-01", endDate: "2027-12-31", status: "Active" },
];

// The mock "directory" for the Team Member persona — REQ-009c (a Team Member
// only ever sees their own allocations) needs some team member id to scope to.
const MOCK_CALLER_TEAM_MEMBER_ID = "tm1";

function roles(request: Request): string[] {
  return rolesFromToken(request.headers.get("authorization"));
}

function forbidden(message: string) {
  return HttpResponse.json({ code: 403, message }, { status: 403 });
}

function notFound(message: string) {
  return HttpResponse.json({ code: 404, message }, { status: 404 });
}

function page<T>(items: T[], url: URL) {
  const limit = Number(url.searchParams.get("limit") ?? 20);
  const offset = Number(url.searchParams.get("offset") ?? 0);
  return { count: items.length, next: null, previous: null, data: items.slice(offset, offset + limit) };
}

export const handlers = [
  // ---- Customers --------------------------------------------------------
  http.get("/api/customers", ({ request }) => HttpResponse.json(page(customers, new URL(request.url)))),

  http.post("/api/customers", async ({ request }) => {
    if (!roles(request).includes("Account Manager")) return forbidden("Only an Account Manager may create customers.");
    const input = (await request.json()) as components["schemas"]["CustomerInput"];
    const created: Customer = { id: freshId("c"), ...input };
    customers = [...customers, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get("/api/customers/:customerId", ({ params }) => {
    const found = customers.find((c) => c.id === params.customerId);
    return found ? HttpResponse.json(found) : notFound("Customer not found.");
  }),

  http.put("/api/customers/:customerId", async ({ params, request }) => {
    if (!roles(request).includes("Account Manager")) return forbidden("Only an Account Manager may edit customers.");
    const index = customers.findIndex((c) => c.id === params.customerId);
    if (index === -1) return notFound("Customer not found.");
    const input = (await request.json()) as components["schemas"]["CustomerInput"];
    customers[index] = { ...customers[index], ...input };
    return HttpResponse.json(customers[index]);
  }),

  // ---- Engagements --------------------------------------------------------
  http.get("/api/engagements", ({ request }) => {
    const url = new URL(request.url);
    let items = engagements;
    const customerId = url.searchParams.get("customerId");
    if (customerId) items = items.filter((e) => e.customerId === customerId);
    const status = url.searchParams.get("status");
    if (status) items = items.filter((e) => e.status === status);
    return HttpResponse.json(page(items, url));
  }),

  http.post("/api/engagements", async ({ request }) => {
    if (!roles(request).includes("Account Manager")) return forbidden("Only an Account Manager may create engagements.");
    const input = (await request.json()) as components["schemas"]["EngagementInput"];
    const created: Engagement = { id: freshId("e"), status: "Active", ...input };
    engagements = [...engagements, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get("/api/engagements/:engagementId", ({ params }) => {
    const found = engagements.find((e) => e.id === params.engagementId);
    return found ? HttpResponse.json(found) : notFound("Engagement not found.");
  }),

  http.put("/api/engagements/:engagementId", async ({ params, request }) => {
    if (!roles(request).includes("Account Manager")) return forbidden("Only an Account Manager may edit engagements.");
    const index = engagements.findIndex((e) => e.id === params.engagementId);
    if (index === -1) return notFound("Engagement not found.");
    const input = (await request.json()) as components["schemas"]["EngagementInput"];
    engagements[index] = { ...engagements[index], ...input };
    return HttpResponse.json(engagements[index]);
  }),

  http.post("/api/engagements/:engagementId/close", ({ params, request }) => {
    if (!roles(request).includes("Account Manager")) return forbidden("Only an Account Manager may close engagements.");
    const index = engagements.findIndex((e) => e.id === params.engagementId);
    if (index === -1) return notFound("Engagement not found.");
    engagements[index] = { ...engagements[index], status: "Closed" };
    return HttpResponse.json(engagements[index]);
  }),

  http.post("/api/engagements/:engagementId/reopen", ({ params, request }) => {
    if (!roles(request).includes("Account Manager")) return forbidden("Only an Account Manager may reopen engagements.");
    const index = engagements.findIndex((e) => e.id === params.engagementId);
    if (index === -1) return notFound("Engagement not found.");
    engagements[index] = { ...engagements[index], status: "Active" };
    return HttpResponse.json(engagements[index]);
  }),

  // ---- Team members --------------------------------------------------------
  http.get("/api/team-members", ({ request }) => HttpResponse.json(page(teamMembers, new URL(request.url)))),

  http.post("/api/team-members", async ({ request }) => {
    if (!roles(request).includes("Allocation Admin")) return forbidden("Only an Allocation Admin may add team members.");
    const input = (await request.json()) as components["schemas"]["TeamMemberInput"];
    const created: TeamMember = { id: freshId("tm"), ...input };
    teamMembers = [...teamMembers, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/team-members/:teamMemberId", async ({ params, request }) => {
    if (!roles(request).includes("Allocation Admin")) return forbidden("Only an Allocation Admin may edit team members.");
    const index = teamMembers.findIndex((m) => m.id === params.teamMemberId);
    if (index === -1) return notFound("Team member not found.");
    const input = (await request.json()) as components["schemas"]["TeamMemberInput"];
    teamMembers[index] = { ...teamMembers[index], ...input };
    return HttpResponse.json(teamMembers[index]);
  }),

  // ---- Allocation requests --------------------------------------------------------
  http.get("/api/allocation-requests", ({ request }) => {
    const url = new URL(request.url);
    let items = allocationRequests;
    const status = url.searchParams.get("status");
    if (status) items = items.filter((r) => r.status === status);
    const engagementId = url.searchParams.get("engagementId");
    if (engagementId) items = items.filter((r) => r.engagementId === engagementId);
    return HttpResponse.json(page(items, url));
  }),

  http.post("/api/allocation-requests", async ({ request }) => {
    if (!roles(request).includes("Account Manager")) return forbidden("Only an Account Manager may submit allocation requests.");
    const input = (await request.json()) as components["schemas"]["AllocationRequestInput"];
    const engagement = engagements.find((e) => e.id === input.engagementId);
    if (engagement?.status !== "Active") {
      return HttpResponse.json({ code: 400, message: "Engagement is not active." }, { status: 400 });
    }
    const created: AllocationRequest = { id: freshId("r"), status: "Pending", ...input };
    allocationRequests = [...allocationRequests, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/api/allocation-requests/:requestId/approve", async ({ params, request }) => {
    if (!roles(request).includes("Resource Manager")) return forbidden("Only a Resource Manager may approve requests.");
    const index = allocationRequests.findIndex((r) => r.id === params.requestId);
    if (index === -1) return notFound("Allocation request not found.");
    const input = (await request.json()) as components["schemas"]["AllocationRequestApproval"];
    allocationRequests[index] = { ...allocationRequests[index], status: "Approved" };
    const created: Allocation = {
      id: freshId("a"),
      allocationRequestId: allocationRequests[index].id,
      engagementId: allocationRequests[index].engagementId,
      status: "Active",
      ...input,
    };
    allocations = [...allocations, created];
    return HttpResponse.json(created);
  }),

  http.post("/api/allocation-requests/:requestId/reject", async ({ params, request }) => {
    if (!roles(request).includes("Resource Manager")) return forbidden("Only a Resource Manager may reject requests.");
    const index = allocationRequests.findIndex((r) => r.id === params.requestId);
    if (index === -1) return notFound("Allocation request not found.");
    const { reason } = (await request.json()) as { reason: string };
    allocationRequests[index] = { ...allocationRequests[index], status: "Rejected", rejectionReason: reason };
    return HttpResponse.json(allocationRequests[index]);
  }),

  // ---- Allocations --------------------------------------------------------
  http.get("/api/allocations", ({ request }) => {
    const url = new URL(request.url);
    let items = allocations;
    const requestRoles = roles(request);
    const teamMemberId =
      url.searchParams.get("teamMemberId") ??
      (requestRoles.includes("Team Member") && !requestRoles.some((r) => r !== "Team Member")
        ? MOCK_CALLER_TEAM_MEMBER_ID
        : null);
    if (teamMemberId) items = items.filter((a) => a.teamMemberId === teamMemberId);
    const engagementId = url.searchParams.get("engagementId");
    if (engagementId) items = items.filter((a) => a.engagementId === engagementId);
    return HttpResponse.json(page(items, url));
  }),

  http.put("/api/allocations/:allocationId", async ({ params, request }) => {
    if (!roles(request).includes("Resource Manager")) return forbidden("Only a Resource Manager may modify allocations.");
    const index = allocations.findIndex((a) => a.id === params.allocationId);
    if (index === -1) return notFound("Allocation not found.");
    const input = (await request.json()) as components["schemas"]["AllocationUpdate"];
    allocations[index] = { ...allocations[index], ...input };
    return HttpResponse.json(allocations[index]);
  }),

  http.post("/api/allocations/:allocationId/end", ({ params, request }) => {
    if (!roles(request).includes("Resource Manager")) return forbidden("Only a Resource Manager may end allocations.");
    const index = allocations.findIndex((a) => a.id === params.allocationId);
    if (index === -1) return notFound("Allocation not found.");
    allocations[index] = { ...allocations[index], status: "Ended" };
    return HttpResponse.json(allocations[index]);
  }),

  // ---- Reports --------------------------------------------------------
  http.get("/api/reports/utilization", ({ request }) => {
    if (!roles(request).includes("Allocation Admin")) return forbidden("Only an Allocation Admin may view the utilization report.");
    const data = teamMembers.map((member) => ({
      teamMemberId: member.id,
      name: member.name,
      totalUtilizationPct: allocations
        .filter((a) => a.teamMemberId === member.id && a.status === "Active")
        .reduce((sum, a) => sum + a.utilizationPct, 0),
    }));
    return HttpResponse.json({ data });
  }),
];
