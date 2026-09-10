import ballerina/http;
import ballerina/sql;
import ballerina/uuid;

const string ENGAGEMENT_STATUS_ACTIVE = "Active";
const string ENGAGEMENT_STATUS_CLOSED = "Closed";

service /engagements on apiListener {

    // Any signed-in caller may view engagements (domain-model.md: view is unrestricted;
    // only edit/close/reopen is owner-gated).
    resource function get .(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            int 'limit = 20, int offset = 0, string? customerId = (), string? status = ())
            returns EngagementPage|http:Unauthorized|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        int lim = clampLimit('limit);
        int off = clampOffset(offset);

        sql:ParameterizedQuery countQuery = `SELECT COUNT(*) FROM engagement WHERE 1 = 1`;
        sql:ParameterizedQuery listQuery = `SELECT id, customer_id AS "customerId", name, description,
                    start_date AS "startDate", end_date AS "endDate", status,
                    owner_account_manager_id AS "ownerAccountManagerId"
             FROM engagement WHERE 1 = 1`;
        if customerId is string {
            countQuery = sql:queryConcat(countQuery, ` AND customer_id = ${customerId}`);
            listQuery = sql:queryConcat(listQuery, ` AND customer_id = ${customerId}`);
        }
        if status is string {
            countQuery = sql:queryConcat(countQuery, ` AND status = ${status}`);
            listQuery = sql:queryConcat(listQuery, ` AND status = ${status}`);
        }
        listQuery = sql:queryConcat(listQuery, ` ORDER BY created_at LIMIT ${lim} OFFSET ${off}`);

        int total = check dbClient->queryRow(countQuery);
        stream<EngagementRow, sql:Error?> rows = dbClient->query(listQuery);
        EngagementRow[] rowList = check from EngagementRow row in rows select row;
        Engagement[] data = [];
        foreach EngagementRow row in rowList {
            StaffingPlanLine[] plan = check fetchStaffingPlan(row.id);
            data.push(toEngagement(row, plan));
        }
        return {count: total, next: nextUri("/engagements", lim, off, total), previous: previousUri("/engagements", lim, off), data: data};
    }

    resource function post .(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            EngagementInput payload) returns http:Created|http:BadRequest|http:Unauthorized|http:Forbidden|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role != ROLE_ACCOUNT_MANAGER {
            return forbidden("only an Account Manager may create an engagement");
        }
        if payload.name.trim() == "" || payload.startDate.trim() == "" || payload.endDate.trim() == "" {
            return badRequest("name, startDate and endDate are required");
        }
        CustomerRow|http:NotFound|error customer = fetchCustomerRow(payload.customerId);
        if customer is http:NotFound {
            return badRequest("customerId does not reference an existing customer");
        }
        if customer is error {
            return customer;
        }

        string id = uuid:createRandomUuid();
        string? description = payload?.description;
        sql:ExecutionResult|error result = dbClient->execute(
            `INSERT INTO engagement (id, customer_id, name, description, start_date, end_date, status, owner_account_manager_id, created_at)
             VALUES (${id}, ${payload.customerId}, ${payload.name}, ${description}, ${payload.startDate}, ${payload.endDate},
                     ${ENGAGEMENT_STATUS_ACTIVE}, ${caller.userId}, ${nowTimestamp()})`);
        if result is error {
            return badRequest("could not create engagement: " + result.message());
        }
        StaffingPlanLine[]? plan = payload?.staffingPlan;
        if plan is StaffingPlanLine[] {
            error? planResult = replaceStaffingPlan(id, plan);
            if planResult is error {
                return badRequest("could not save staffing plan: " + planResult.message());
            }
        }
        EngagementRow row = {id: id, customerId: payload.customerId, name: payload.name, description: description,
            startDate: payload.startDate, endDate: payload.endDate, status: ENGAGEMENT_STATUS_ACTIVE, ownerAccountManagerId: caller.userId};
        return <http:Created>{body: toEngagement(row, plan is StaffingPlanLine[] ? plan : [])};
    }

    resource function get [string engagementId](@http:Header string? x\-user\-id, @http:Header string? x\-user\-name)
            returns Engagement|http:NotFound|http:Unauthorized|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        EngagementRow|http:NotFound|error row = fetchEngagementRow(engagementId);
        if row is http:NotFound || row is error {
            return row;
        }
        StaffingPlanLine[] plan = check fetchStaffingPlan(engagementId);
        return toEngagement(row, plan);
    }

    resource function put [string engagementId](@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            EngagementInput payload) returns Engagement|http:BadRequest|http:Unauthorized|http:Forbidden|http:NotFound|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        EngagementRow|http:NotFound|error existing = fetchEngagementRow(engagementId);
        if existing is http:NotFound || existing is error {
            return existing;
        }
        if caller.role != ROLE_ACCOUNT_MANAGER || caller.userId != existing.ownerAccountManagerId {
            return forbidden("only the creating Account Manager may edit this engagement");
        }
        if payload.name.trim() == "" || payload.startDate.trim() == "" || payload.endDate.trim() == "" {
            return badRequest("name, startDate and endDate are required");
        }
        CustomerRow|http:NotFound|error customer = fetchCustomerRow(payload.customerId);
        if customer is http:NotFound {
            return badRequest("customerId does not reference an existing customer");
        }
        if customer is error {
            return customer;
        }

        // Staffing-plan edits here never create allocations (REQ-011c) — this only ever
        // touches the engagement row and staffing_plan_line, never allocation_request/allocation.
        string? description = payload?.description;
        sql:ExecutionResult|error result = dbClient->execute(
            `UPDATE engagement SET customer_id = ${payload.customerId}, name = ${payload.name},
                    description = ${description}, start_date = ${payload.startDate}, end_date = ${payload.endDate}
             WHERE id = ${engagementId}`);
        if result is error {
            return badRequest("could not update engagement: " + result.message());
        }
        StaffingPlanLine[]? plan = payload?.staffingPlan;
        StaffingPlanLine[] effectivePlan;
        if plan is StaffingPlanLine[] {
            error? planResult = replaceStaffingPlan(engagementId, plan);
            if planResult is error {
                return badRequest("could not save staffing plan: " + planResult.message());
            }
            effectivePlan = plan;
        } else {
            effectivePlan = check fetchStaffingPlan(engagementId);
        }
        EngagementRow updated = {id: engagementId, customerId: payload.customerId, name: payload.name, description: description,
            startDate: payload.startDate, endDate: payload.endDate, status: existing.status, ownerAccountManagerId: existing.ownerAccountManagerId};
        return toEngagement(updated, effectivePlan);
    }

    resource function post [string engagementId]/close(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name)
            returns Engagement|http:Unauthorized|http:Forbidden|http:NotFound|error {
        return setEngagementStatus(x\-user\-id, x\-user\-name, engagementId, ENGAGEMENT_STATUS_CLOSED);
    }

    resource function post [string engagementId]/reopen(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name)
            returns Engagement|http:Unauthorized|http:Forbidden|http:NotFound|error {
        return setEngagementStatus(x\-user\-id, x\-user\-name, engagementId, ENGAGEMENT_STATUS_ACTIVE);
    }
}

function setEngagementStatus(string? xUserId, string? xUserName, string engagementId, string newStatus)
        returns Engagement|http:Unauthorized|http:Forbidden|http:NotFound|error {
    CallerContext|http:Unauthorized caller = resolveCaller(xUserId, xUserName);
    if caller is http:Unauthorized {
        return caller;
    }
    EngagementRow|http:NotFound|error existing = fetchEngagementRow(engagementId);
    if existing is http:NotFound || existing is error {
        return existing;
    }
    if caller.role != ROLE_ACCOUNT_MANAGER || caller.userId != existing.ownerAccountManagerId {
        return forbidden("only the creating Account Manager may change this engagement's status");
    }
    // Closing/reopening never touches allocations or existing allocation dates —
    // existing allocations continue to be tracked to their own end dates.
    sql:ExecutionResult|error result = dbClient->execute(`UPDATE engagement SET status = ${newStatus} WHERE id = ${engagementId}`);
    if result is error {
        return result;
    }
    StaffingPlanLine[] plan = check fetchStaffingPlan(engagementId);
    EngagementRow updated = {id: existing.id, customerId: existing.customerId, name: existing.name, description: existing.description,
        startDate: existing.startDate, endDate: existing.endDate, status: newStatus, ownerAccountManagerId: existing.ownerAccountManagerId};
    return toEngagement(updated, plan);
}

function fetchEngagementRow(string engagementId) returns EngagementRow|http:NotFound|error {
    EngagementRow|error row = dbClient->queryRow(
        `SELECT id, customer_id AS "customerId", name, description, start_date AS "startDate",
                end_date AS "endDate", status, owner_account_manager_id AS "ownerAccountManagerId"
         FROM engagement WHERE id = ${engagementId}`);
    if row is sql:NoRowsError {
        return notFound("engagement not found");
    }
    if row is error {
        return row;
    }
    return row;
}

function fetchStaffingPlan(string engagementId) returns StaffingPlanLine[]|error {
    stream<StaffingPlanLineRow, sql:Error?> rows = dbClient->query(
        `SELECT role, target_headcount AS "targetHeadcount" FROM staffing_plan_line WHERE engagement_id = ${engagementId} ORDER BY role`);
    StaffingPlanLineRow[] rowList = check from StaffingPlanLineRow row in rows select row;
    return from StaffingPlanLineRow row in rowList select {role: row.role, targetHeadcount: row.targetHeadcount};
}

function replaceStaffingPlan(string engagementId, StaffingPlanLine[] plan) returns error? {
    _ = check dbClient->execute(`DELETE FROM staffing_plan_line WHERE engagement_id = ${engagementId}`);
    foreach StaffingPlanLine line in plan {
        string lineId = uuid:createRandomUuid();
        _ = check dbClient->execute(
            `INSERT INTO staffing_plan_line (id, engagement_id, role, target_headcount)
             VALUES (${lineId}, ${engagementId}, ${line.role}, ${line.targetHeadcount})`);
    }
    return;
}

function toEngagement(EngagementRow row, StaffingPlanLine[] plan) returns Engagement => {
    id: row.id,
    customerId: row.customerId,
    name: row.name,
    description: row.description,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    staffingPlan: plan
};
