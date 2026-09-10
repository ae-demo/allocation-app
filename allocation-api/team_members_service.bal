import ballerina/http;
import ballerina/sql;
import ballerina/uuid;

service /team\-members on apiListener {

    // Readable by every non-Team-Member role: a Resource Manager needs the directory to
    // assign requests, an Account Manager to see who is available, an Allocation Admin
    // to manage it. A Team Member's own permission is scoped to "read own allocations".
    resource function get .(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            int 'limit = 20, int offset = 0) returns TeamMemberPage|http:Unauthorized|http:Forbidden|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role == ROLE_TEAM_MEMBER {
            return forbidden("Team Members may not browse the team member directory");
        }
        int lim = clampLimit('limit);
        int off = clampOffset(offset);

        int total = check dbClient->queryRow(`SELECT COUNT(*) FROM team_member`);
        stream<TeamMemberRow, sql:Error?> rows = dbClient->query(
            `SELECT id, name, email, title FROM team_member ORDER BY name LIMIT ${lim} OFFSET ${off}`);
        TeamMemberRow[] rowList = check from TeamMemberRow row in rows select row;
        TeamMember[] data = from TeamMemberRow row in rowList select toTeamMember(row);
        return {count: total, next: nextUri("/team-members", lim, off, total), previous: previousUri("/team-members", lim, off), data: data};
    }

    resource function post .(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            TeamMemberInput payload) returns http:Created|http:BadRequest|http:Unauthorized|http:Forbidden|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role != ROLE_ALLOCATION_ADMIN {
            return forbidden("only an Allocation Admin may add a team member");
        }
        if payload.name.trim() == "" || payload.email.trim() == "" {
            return badRequest("name and email are required");
        }

        string id = uuid:createRandomUuid();
        string? title = payload?.title;
        sql:ExecutionResult|error result = dbClient->execute(
            `INSERT INTO team_member (id, name, email, title, created_at)
             VALUES (${id}, ${payload.name}, ${payload.email}, ${title}, ${nowTimestamp()})`);
        if result is error {
            return badRequest("could not create team member: " + result.message());
        }
        return <http:Created>{body: toTeamMember({id: id, name: payload.name, email: payload.email, title: title})};
    }

    resource function put [string teamMemberId](@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            TeamMemberInput payload) returns TeamMember|http:BadRequest|http:Unauthorized|http:Forbidden|http:NotFound|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role != ROLE_ALLOCATION_ADMIN {
            return forbidden("only an Allocation Admin may update the team member directory");
        }
        TeamMemberRow|error existing = dbClient->queryRow(
            `SELECT id, name, email, title FROM team_member WHERE id = ${teamMemberId}`);
        if existing is sql:NoRowsError {
            return notFound("team member not found");
        }
        if existing is error {
            return existing;
        }
        if payload.name.trim() == "" || payload.email.trim() == "" {
            return badRequest("name and email are required");
        }

        string? title = payload?.title;
        sql:ExecutionResult|error result = dbClient->execute(
            `UPDATE team_member SET name = ${payload.name}, email = ${payload.email}, title = ${title} WHERE id = ${teamMemberId}`);
        if result is error {
            return badRequest("could not update team member: " + result.message());
        }
        return toTeamMember({id: teamMemberId, name: payload.name, email: payload.email, title: title});
    }
}

function toTeamMember(TeamMemberRow row) returns TeamMember => {
    id: row.id,
    name: row.name,
    email: row.email,
    title: row.title
};
