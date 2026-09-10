// Typed client for the allocation-api sibling, generated from its committed
// openapi.yaml. Same-origin baseUrl: nginx proxies /api to the sibling
// through the API gateway (react-webapp's Same-origin API proxy).

import createClient from "openapi-fetch";
import type { paths } from "./generated/allocation-api";
import { getAccessToken, signIn } from "./auth";
import type {
  AllocationRequestApproval,
  AllocationRequestInput,
  AllocationUpdate,
  CustomerInput,
  EngagementInput,
  TeamMemberInput,
} from "./types";

export const allocationApi = createClient<paths>({ baseUrl: "/api" });

allocationApi.use({
  async onRequest({ request }) {
    const token = await getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      await signIn();
    }
    return response;
  },
});

// The gateway derives the real caller identity from the bearer token and
// injects its own X-User-Id (nginx clears any value the browser sends first —
// see nginx/default.conf); the contract still declares the header required,
// so this placeholder only satisfies the generated type at every call below.
const IDENTITY_HEADER = { "X-User-Id": "browser-does-not-set-this" };

// One thin wrapper per allocation-api operation the app calls, so every page
// reads and writes the shapes openapi.yaml declares — never a hand-rolled one
// — without repeating the identity-header placeholder at each call site.
export const api = {
  listCustomers: (query?: { limit?: number; offset?: number }) =>
    allocationApi.GET("/customers", { params: { header: IDENTITY_HEADER, query } }),
  createCustomer: (body: CustomerInput) =>
    allocationApi.POST("/customers", { params: { header: IDENTITY_HEADER }, body }),
  getCustomer: (customerId: string) =>
    allocationApi.GET("/customers/{customerId}", { params: { header: IDENTITY_HEADER, path: { customerId } } }),

  listEngagements: (query?: { limit?: number; offset?: number; customerId?: string; engagementId?: string }) =>
    allocationApi.GET("/engagements", { params: { header: IDENTITY_HEADER, query } }),
  createEngagement: (body: EngagementInput) =>
    allocationApi.POST("/engagements", { params: { header: IDENTITY_HEADER }, body }),
  getEngagement: (engagementId: string) =>
    allocationApi.GET("/engagements/{engagementId}", { params: { header: IDENTITY_HEADER, path: { engagementId } } }),
  closeEngagement: (engagementId: string) =>
    allocationApi.POST("/engagements/{engagementId}/close", {
      params: { header: IDENTITY_HEADER, path: { engagementId } },
    }),
  reopenEngagement: (engagementId: string) =>
    allocationApi.POST("/engagements/{engagementId}/reopen", {
      params: { header: IDENTITY_HEADER, path: { engagementId } },
    }),

  listTeamMembers: (query?: { limit?: number; offset?: number }) =>
    allocationApi.GET("/team-members", { params: { header: IDENTITY_HEADER, query } }),
  createTeamMember: (body: TeamMemberInput) =>
    allocationApi.POST("/team-members", { params: { header: IDENTITY_HEADER }, body }),

  listAllocationRequests: (query?: {
    limit?: number;
    offset?: number;
    status?: "Pending" | "Approved" | "Rejected";
    engagementId?: string;
  }) => allocationApi.GET("/allocation-requests", { params: { header: IDENTITY_HEADER, query } }),
  createAllocationRequest: (body: AllocationRequestInput) =>
    allocationApi.POST("/allocation-requests", { params: { header: IDENTITY_HEADER }, body }),
  approveAllocationRequest: (requestId: string, body: AllocationRequestApproval) =>
    allocationApi.POST("/allocation-requests/{requestId}/approve", {
      params: { header: IDENTITY_HEADER, path: { requestId } },
      body,
    }),
  rejectAllocationRequest: (requestId: string, reason: string) =>
    allocationApi.POST("/allocation-requests/{requestId}/reject", {
      params: { header: IDENTITY_HEADER, path: { requestId } },
      body: { reason },
    }),

  listAllocations: (query?: { limit?: number; offset?: number; teamMemberId?: string; engagementId?: string }) =>
    allocationApi.GET("/allocations", { params: { header: IDENTITY_HEADER, query } }),
  updateAllocation: (allocationId: string, body: AllocationUpdate) =>
    allocationApi.PUT("/allocations/{allocationId}", {
      params: { header: IDENTITY_HEADER, path: { allocationId } },
      body,
    }),
  endAllocation: (allocationId: string) =>
    allocationApi.POST("/allocations/{allocationId}/end", {
      params: { header: IDENTITY_HEADER, path: { allocationId } },
    }),

  getUtilizationReport: () =>
    allocationApi.GET("/reports/utilization", { params: { header: IDENTITY_HEADER } }),
};
