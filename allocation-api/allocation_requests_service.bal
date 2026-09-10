import ballerina/http;
import ballerina/sql;
import ballerina/uuid;

const string REQUEST_STATUS_PENDING = "Pending";
const string REQUEST_STATUS_APPROVED = "Approved";
const string REQUEST_STATUS_REJECTED = "Rejected";

service /allocation\-requests on apiListener {

    // Reviewing/creating requests is Account Manager / Resource Manager / Allocation
    // Admin territory; a Team Member's only allocation-api permission is reading their
    // own allocations, not requests.
    resource function get .(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            int 'limit = 20, int offset = 0, string? status = (), string? engagementId = ())
            returns AllocationRequestPage|http:Unauthorized|http:Forbidden|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role == ROLE_TEAM_MEMBER {
            return forbidden("Team Members may not view allocation requests");
        }
        int lim = clampLimit('limit);
        int off = clampOffset(offset);

        sql:ParameterizedQuery countQuery = `SELECT COUNT(*) FROM allocation_request WHERE 1 = 1`;
        sql:ParameterizedQuery listQuery = `SELECT id, engagement_id AS "engagementId", role, utilization_pct AS "utilizationPct",
                    start_date AS "startDate", end_date AS "endDate", status,
                    requested_by_account_manager_id AS "requestedByAccountManagerId", rejection_reason AS "rejectionReason"
             FROM allocation_request WHERE 1 = 1`;
        if status is string {
            countQuery = sql:queryConcat(countQuery, ` AND status = ${status}`);
            listQuery = sql:queryConcat(listQuery, ` AND status = ${status}`);
        }
        if engagementId is string {
            countQuery = sql:queryConcat(countQuery, ` AND engagement_id = ${engagementId}`);
            listQuery = sql:queryConcat(listQuery, ` AND engagement_id = ${engagementId}`);
        }
        listQuery = sql:queryConcat(listQuery, ` ORDER BY created_at LIMIT ${lim} OFFSET ${off}`);

        int total = check dbClient->queryRow(countQuery);
        stream<AllocationRequestRow, sql:Error?> rows = dbClient->query(listQuery);
        AllocationRequestRow[] rowList = check from AllocationRequestRow row in rows select row;
        AllocationRequest[] data = from AllocationRequestRow row in rowList select toAllocationRequest(row);
        return {count: total, next: nextUri("/allocation-requests", lim, off, total), previous: previousUri("/allocation-requests", lim, off), data: data};
    }

    resource function post .(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            AllocationRequestInput payload) returns http:Created|http:BadRequest|http:Unauthorized|http:Forbidden|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role != ROLE_ACCOUNT_MANAGER {
            return forbidden("only an Account Manager may submit an allocation request");
        }
        if payload.role.trim() == "" || payload.startDate.trim() == "" || payload.endDate.trim() == "" {
            return badRequest("role, startDate and endDate are required");
        }
        if payload.utilizationPct <= 0 || payload.utilizationPct > 100 {
            return badRequest("utilizationPct must be between 1 and 100");
        }

        EngagementRow|http:NotFound|error engagement = fetchEngagementRow(payload.engagementId);
        if engagement is http:NotFound {
            return badRequest("engagementId does not reference an existing engagement");
        }
        if engagement is error {
            return engagement;
        }
        // REQ-003c: engagement status gates new allocation requests.
        if engagement.status != ENGAGEMENT_STATUS_ACTIVE {
            return badRequest("engagement is closed; new allocation requests cannot be submitted against it");
        }

        string id = uuid:createRandomUuid();
        sql:ExecutionResult|error result = dbClient->execute(
            `INSERT INTO allocation_request (id, engagement_id, role, utilization_pct, start_date, end_date, status, requested_by_account_manager_id, created_at)
             VALUES (${id}, ${payload.engagementId}, ${payload.role}, ${payload.utilizationPct}, ${payload.startDate}, ${payload.endDate},
                     ${REQUEST_STATUS_PENDING}, ${caller.userId}, ${nowTimestamp()})`);
        if result is error {
            return badRequest("could not create allocation request: " + result.message());
        }

        // REQ-014: notify every Resource Manager of the new request. Best-effort — a
        // SendGrid failure or missing credential never fails this response.
        AppUserRow[]|error resourceManagers = fetchUsersByRole(ROLE_RESOURCE_MANAGER);
        if resourceManagers is AppUserRow[] {
            notifyUsers(resourceManagers, "New allocation request pending review",
                string `A new allocation request (role: ${payload.role}, ${payload.utilizationPct}% utilization) was submitted for engagement ${payload.engagementId}.`);
        }

        return <http:Created>{body: {id: id, engagementId: payload.engagementId, role: payload.role, utilizationPct: payload.utilizationPct,
            startDate: payload.startDate, endDate: payload.endDate, status: REQUEST_STATUS_PENDING}};
    }

    resource function post [string requestId]/approve(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            AllocationRequestApproval payload) returns Allocation|http:BadRequest|http:Unauthorized|http:Forbidden|http:NotFound|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role != ROLE_RESOURCE_MANAGER {
            return forbidden("only a Resource Manager may approve an allocation request");
        }
        AllocationRequestRow|http:NotFound|error existing = fetchAllocationRequestRow(requestId);
        if existing is http:NotFound || existing is error {
            return existing;
        }
        if existing.status != REQUEST_STATUS_PENDING {
            return badRequest("allocation request has already been decided");
        }
        if payload.teamMemberId.trim() == "" || payload.role.trim() == "" || payload.startDate.trim() == "" || payload.endDate.trim() == "" {
            return badRequest("teamMemberId, role, startDate and endDate are required");
        }
        if payload.utilizationPct <= 0 || payload.utilizationPct > 100 {
            return badRequest("utilizationPct must be between 1 and 100");
        }
        TeamMemberRow|error teamMember = dbClient->queryRow(
            `SELECT id, name, email, title FROM team_member WHERE id = ${payload.teamMemberId}`);
        if teamMember is sql:NoRowsError {
            return badRequest("teamMemberId does not reference an existing team member");
        }
        if teamMember is error {
            return teamMember;
        }

        string allocationId = uuid:createRandomUuid();
        // REQ-005: approving a request creates an allocation and flips the request to Approved.
        sql:ExecutionResult|error inserted = dbClient->execute(
            `INSERT INTO allocation (id, allocation_request_id, engagement_id, team_member_id, role, utilization_pct,
                    start_date, end_date, original_end_date, status, created_at)
             VALUES (${allocationId}, ${requestId}, ${existing.engagementId}, ${payload.teamMemberId}, ${payload.role},
                     ${payload.utilizationPct}, ${payload.startDate}, ${payload.endDate}, ${payload.endDate}, ${ALLOCATION_STATUS_ACTIVE}, ${nowTimestamp()})`);
        if inserted is error {
            return badRequest("could not create allocation: " + inserted.message());
        }
        sql:ExecutionResult|error updated = dbClient->execute(
            `UPDATE allocation_request SET status = ${REQUEST_STATUS_APPROVED} WHERE id = ${requestId}`);
        if updated is error {
            return updated;
        }

        // REQ-014: notify the requesting Account Manager and the assigned Team Member.
        AppUserRow|error requester = dbClient->queryRow(
            `SELECT user_id AS "userId", role, email FROM app_user WHERE user_id = ${existing.requestedByAccountManagerId}`);
        if requester is AppUserRow {
            notify(requester.email, requester.email, "Allocation request approved",
                string `Your allocation request for engagement ${existing.engagementId} was approved and assigned to ${teamMember.name}.`);
        }
        notify(teamMember.email, teamMember.name, "You have been assigned to a new allocation",
            string `You have been assigned to engagement ${existing.engagementId} as ${payload.role} at ${payload.utilizationPct}% utilization, ${payload.startDate} to ${payload.endDate}.`);

        return {id: allocationId, allocationRequestId: requestId, engagementId: existing.engagementId, teamMemberId: payload.teamMemberId,
            role: payload.role, utilizationPct: payload.utilizationPct, startDate: payload.startDate, endDate: payload.endDate, status: ALLOCATION_STATUS_ACTIVE};
    }

    resource function post [string requestId]/reject(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            RejectRequestBody payload) returns AllocationRequest|http:BadRequest|http:Unauthorized|http:Forbidden|http:NotFound|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role != ROLE_RESOURCE_MANAGER {
            return forbidden("only a Resource Manager may reject an allocation request");
        }
        AllocationRequestRow|http:NotFound|error existing = fetchAllocationRequestRow(requestId);
        if existing is http:NotFound || existing is error {
            return existing;
        }
        if existing.status != REQUEST_STATUS_PENDING {
            return badRequest("allocation request has already been decided");
        }
        if payload.reason.trim() == "" {
            return badRequest("reason is required");
        }

        // REQ-006: rejecting stores a reason retrievable by the requester.
        sql:ExecutionResult|error result = dbClient->execute(
            `UPDATE allocation_request SET status = ${REQUEST_STATUS_REJECTED}, rejection_reason = ${payload.reason} WHERE id = ${requestId}`);
        if result is error {
            return result;
        }

        AppUserRow|error requester = dbClient->queryRow(
            `SELECT user_id AS "userId", role, email FROM app_user WHERE user_id = ${existing.requestedByAccountManagerId}`);
        if requester is AppUserRow {
            notify(requester.email, requester.email, "Allocation request rejected",
                string `Your allocation request for engagement ${existing.engagementId} was rejected: ${payload.reason}`);
        }

        return {id: existing.id, engagementId: existing.engagementId, role: existing.role, utilizationPct: existing.utilizationPct,
            startDate: existing.startDate, endDate: existing.endDate, status: REQUEST_STATUS_REJECTED, rejectionReason: payload.reason};
    }
}

function fetchAllocationRequestRow(string requestId) returns AllocationRequestRow|http:NotFound|error {
    AllocationRequestRow|error row = dbClient->queryRow(
        `SELECT id, engagement_id AS "engagementId", role, utilization_pct AS "utilizationPct",
                start_date AS "startDate", end_date AS "endDate", status,
                requested_by_account_manager_id AS "requestedByAccountManagerId", rejection_reason AS "rejectionReason"
         FROM allocation_request WHERE id = ${requestId}`);
    if row is sql:NoRowsError {
        return notFound("allocation request not found");
    }
    if row is error {
        return row;
    }
    return row;
}

function fetchUsersByRole(string role) returns AppUserRow[]|error {
    stream<AppUserRow, sql:Error?> rows = dbClient->query(
        `SELECT user_id AS "userId", role, email FROM app_user WHERE role = ${role}`);
    return from AppUserRow row in rows select row;
}

function toAllocationRequest(AllocationRequestRow row) returns AllocationRequest => {
    id: row.id,
    engagementId: row.engagementId,
    role: row.role,
    utilizationPct: row.utilizationPct,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    rejectionReason: row.rejectionReason
};
