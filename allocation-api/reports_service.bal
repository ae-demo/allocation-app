import ballerina/http;
import ballerina/sql;

public type UtilizationRow record {|
    string teamMemberId;
    string name;
    int totalUtilizationPct;
|};

service /reports on apiListener {

    // security.json: utilization reporting is an Allocation Admin permission.
    resource function get utilization(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name)
            returns UtilizationReport|http:Unauthorized|http:Forbidden|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role != ROLE_ALLOCATION_ADMIN {
            return forbidden("only an Allocation Admin may view the utilization report");
        }

        // REQ-010: sum of ACTIVE-allocation utilization % per team member; team members
        // with no active allocation still appear, at 0%.
        stream<UtilizationRow, sql:Error?> rows = dbClient->query(`
            SELECT tm.id AS "teamMemberId", tm.name AS "name",
                   CAST(COALESCE(SUM(CASE WHEN a.status = 'Active' THEN a.utilization_pct ELSE 0 END), 0) AS INT) AS "totalUtilizationPct"
            FROM team_member tm
            LEFT JOIN allocation a ON a.team_member_id = tm.id
            GROUP BY tm.id, tm.name
            ORDER BY tm.name
        `);
        UtilizationRow[] rowList = check from UtilizationRow row in rows select row;
        TeamMemberUtilization[] data = from UtilizationRow row in rowList
            select {teamMemberId: row.teamMemberId, name: row.name, totalUtilizationPct: row.totalUtilizationPct};
        return {data: data};
    }
}
