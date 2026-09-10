import ballerina/http;
import ballerina/sql;

const string ALLOCATION_STATUS_ACTIVE = "Active";
const string ALLOCATION_STATUS_ENDED = "Ended";

service /allocations on apiListener {

    // A Team Member's own X-User-Id doubles as their team_member id (see
    // ensureTeamMemberLinked in auth.bal), so "defaults to caller when they are a Team
    // Member" is enforced by overriding — never merely defaulting — the teamMemberId
    // filter for that role: their allocation-api permission is "read own allocations"
    // only, so any teamMemberId they pass is ignored rather than honoured.
    resource function get .(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            int 'limit = 20, int offset = 0, string? teamMemberId = (), string? engagementId = ())
            returns AllocationPage|http:Unauthorized|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        int lim = clampLimit('limit);
        int off = clampOffset(offset);

        string? effectiveTeamMemberId = caller.role == ROLE_TEAM_MEMBER ? caller.userId : teamMemberId;

        sql:ParameterizedQuery countQuery = `SELECT COUNT(*) FROM allocation WHERE 1 = 1`;
        sql:ParameterizedQuery listQuery = `SELECT id, allocation_request_id AS "allocationRequestId", engagement_id AS "engagementId",
                    team_member_id AS "teamMemberId", role, utilization_pct AS "utilizationPct",
                    start_date AS "startDate", end_date AS "endDate", original_end_date AS "originalEndDate", status
             FROM allocation WHERE 1 = 1`;
        if effectiveTeamMemberId is string {
            countQuery = sql:queryConcat(countQuery, ` AND team_member_id = ${effectiveTeamMemberId}`);
            listQuery = sql:queryConcat(listQuery, ` AND team_member_id = ${effectiveTeamMemberId}`);
        }
        if engagementId is string {
            countQuery = sql:queryConcat(countQuery, ` AND engagement_id = ${engagementId}`);
            listQuery = sql:queryConcat(listQuery, ` AND engagement_id = ${engagementId}`);
        }
        listQuery = sql:queryConcat(listQuery, ` ORDER BY created_at LIMIT ${lim} OFFSET ${off}`);

        int total = check dbClient->queryRow(countQuery);
        stream<AllocationRow, sql:Error?> rows = dbClient->query(listQuery);
        AllocationRow[] rowList = check from AllocationRow row in rows select row;
        Allocation[] data = from AllocationRow row in rowList select toAllocation(row);
        return {count: total, next: nextUri("/allocations", lim, off, total), previous: previousUri("/allocations", lim, off), data: data};
    }

    resource function put [string allocationId](@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            AllocationUpdate payload) returns Allocation|http:BadRequest|http:Unauthorized|http:Forbidden|http:NotFound|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role != ROLE_RESOURCE_MANAGER {
            return forbidden("only a Resource Manager may modify an allocation");
        }
        AllocationRow|http:NotFound|error existing = fetchAllocationRow(allocationId);
        if existing is http:NotFound || existing is error {
            return existing;
        }
        // REQ-008: modifying an allocation only works before its ORIGINAL end date.
        if today() >= existing.originalEndDate {
            return badRequest("allocation can no longer be modified: its original end date has passed");
        }
        if existing.status != ALLOCATION_STATUS_ACTIVE {
            return badRequest("allocation has already ended");
        }

        string newRole = payload?.role ?: existing.role;
        int newUtilizationPct = payload?.utilizationPct ?: existing.utilizationPct;
        string newStartDate = payload?.startDate ?: existing.startDate;
        string newEndDate = payload?.endDate ?: existing.endDate;
        if newUtilizationPct <= 0 || newUtilizationPct > 100 {
            return badRequest("utilizationPct must be between 1 and 100");
        }

        sql:ExecutionResult|error result = dbClient->execute(
            `UPDATE allocation SET role = ${newRole}, utilization_pct = ${newUtilizationPct},
                    start_date = ${newStartDate}, end_date = ${newEndDate}
             WHERE id = ${allocationId}`);
        if result is error {
            return badRequest("could not update allocation: " + result.message());
        }
        AllocationRow updated = {id: existing.id, allocationRequestId: existing.allocationRequestId, engagementId: existing.engagementId,
            teamMemberId: existing.teamMemberId, role: newRole, utilizationPct: newUtilizationPct, startDate: newStartDate,
            endDate: newEndDate, originalEndDate: existing.originalEndDate, status: existing.status};
        return toAllocation(updated);
    }

    resource function post [string allocationId]/end(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name)
            returns Allocation|http:BadRequest|http:Unauthorized|http:Forbidden|http:NotFound|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role != ROLE_RESOURCE_MANAGER {
            return forbidden("only a Resource Manager may end an allocation");
        }
        AllocationRow|http:NotFound|error existing = fetchAllocationRow(allocationId);
        if existing is http:NotFound || existing is error {
            return existing;
        }
        // REQ-008: ending an allocation only works before its ORIGINAL end date.
        if today() >= existing.originalEndDate {
            return badRequest("allocation can no longer be ended: its original end date has passed");
        }
        if existing.status != ALLOCATION_STATUS_ACTIVE {
            return badRequest("allocation has already ended");
        }

        string endedOn = today();
        sql:ExecutionResult|error result = dbClient->execute(
            `UPDATE allocation SET status = ${ALLOCATION_STATUS_ENDED}, end_date = ${endedOn} WHERE id = ${allocationId}`);
        if result is error {
            return result;
        }
        AllocationRow updated = {id: existing.id, allocationRequestId: existing.allocationRequestId, engagementId: existing.engagementId,
            teamMemberId: existing.teamMemberId, role: existing.role, utilizationPct: existing.utilizationPct, startDate: existing.startDate,
            endDate: endedOn, originalEndDate: existing.originalEndDate, status: ALLOCATION_STATUS_ENDED};
        return toAllocation(updated);
    }
}

function fetchAllocationRow(string allocationId) returns AllocationRow|http:NotFound|error {
    AllocationRow|error row = dbClient->queryRow(
        `SELECT id, allocation_request_id AS "allocationRequestId", engagement_id AS "engagementId",
                team_member_id AS "teamMemberId", role, utilization_pct AS "utilizationPct",
                start_date AS "startDate", end_date AS "endDate", original_end_date AS "originalEndDate", status
         FROM allocation WHERE id = ${allocationId}`);
    if row is sql:NoRowsError {
        return notFound("allocation not found");
    }
    if row is error {
        return row;
    }
    return row;
}

function toAllocation(AllocationRow row) returns Allocation => {
    id: row.id,
    allocationRequestId: row.allocationRequestId,
    engagementId: row.engagementId,
    teamMemberId: row.teamMemberId,
    role: row.role,
    utilizationPct: row.utilizationPct,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status
};
