// Aliases onto the generated allocation-api schemas, so pages never hand-roll
// a shape — src/generated/allocation-api.ts is the single source of truth.

import type { components } from "./generated/allocation-api";

export type Customer = components["schemas"]["Customer"];
export type CustomerInput = components["schemas"]["CustomerInput"];
export type StaffingPlanLine = components["schemas"]["StaffingPlanLine"];
export type Engagement = components["schemas"]["Engagement"];
export type EngagementInput = components["schemas"]["EngagementInput"];
export type TeamMember = components["schemas"]["TeamMember"];
export type TeamMemberInput = components["schemas"]["TeamMemberInput"];
export type AllocationRequest = components["schemas"]["AllocationRequest"];
export type AllocationRequestInput = components["schemas"]["AllocationRequestInput"];
export type AllocationRequestApproval = components["schemas"]["AllocationRequestApproval"];
export type Allocation = components["schemas"]["Allocation"];
export type AllocationUpdate = components["schemas"]["AllocationUpdate"];
export type TeamMemberUtilization = components["schemas"]["TeamMemberUtilization"];
export type ApiError = components["schemas"]["Error"];
