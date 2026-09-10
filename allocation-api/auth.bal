import ballerina/http;
import ballerina/log;
import ballerina/sql;

// Role names — must match specs/design/security.json `roles[].name` exactly.
const string ROLE_TEAM_MEMBER = "Team Member";
const string ROLE_ACCOUNT_MANAGER = "Account Manager";
const string ROLE_RESOURCE_MANAGER = "Resource Manager";
const string ROLE_ALLOCATION_ADMIN = "Allocation Admin";

// security.json coldStartRole: a caller with no stored record yet gets one created at
// this role on first sign-in, keyed by X-User-Id.
const string COLD_START_ROLE = ROLE_TEAM_MEMBER;

// Resolves the caller's identity and role. security.json's `publicComponents` is empty
// and declares no directory dependency, so this service owns its own people/role
// records ("No directory is published" path): the role is read from the stored
// per-user record, created at the cold-start role on first sight. openapi.yaml has no
// endpoint to grant/elevate a role — that is out of scope for this contract, so role
// elevation must be seeded directly in allocation-db until one exists.
function resolveCaller(string? xUserId, string? xUserName) returns CallerContext|http:Unauthorized {
    if xUserId is () || xUserId.trim() == "" {
        return unauthorized();
    }
    string userId = xUserId;
    string? trimmedName = xUserName is string && xUserName.trim() != "" ? xUserName.trim() : ();

    AppUserRow|error existing = dbClient->queryRow(
        `SELECT user_id AS "userId", role, email FROM app_user WHERE user_id = ${userId}`);
    if existing is AppUserRow {
        if trimmedName is string && trimmedName != existing.email {
            sql:ExecutionResult|error updated = dbClient->execute(
                `UPDATE app_user SET email = ${trimmedName} WHERE user_id = ${userId}`);
            if updated is error {
                log:printError("failed to refresh app_user contact email", 'error = updated, userId = userId);
            }
        }
        CallerContext caller = {userId: existing.userId, role: existing.role};
        ensureTeamMemberLinked(caller, trimmedName);
        return caller;
    }
    if !(existing is sql:NoRowsError) {
        log:printError("failed to resolve caller record; falling back to cold-start role", 'error = existing, userId = userId);
    }

    string derivedEmail = trimmedName is string ? trimmedName : userId;
    sql:ExecutionResult|error inserted = dbClient->execute(
        `INSERT INTO app_user (user_id, role, email, created_at)
         VALUES (${userId}, ${COLD_START_ROLE}, ${derivedEmail}, ${nowTimestamp()})
         ON CONFLICT (user_id) DO NOTHING`);
    if inserted is error {
        log:printError("failed to create app_user record", 'error = inserted, userId = userId);
    }
    CallerContext caller = {userId: userId, role: COLD_START_ROLE};
    ensureTeamMemberLinked(caller, trimmedName);
    return caller;
}

// A Team Member's own X-User-Id doubles as their team_member directory id, auto-
// provisioned here. The OpenAPI contract has no field linking a TeamMemberInput
// record to a signed-in caller (TeamMemberInput carries only name/email/title), so
// this is the only way "their own allocations" (the teamMemberId default on
// GET /allocations) is well-defined without inventing a new endpoint. A Resource
// Manager sees the auto-provisioned row via listTeamMembers and can assign it like
// any other directory entry; an Allocation Admin can rename it later via
// updateTeamMember.
function ensureTeamMemberLinked(CallerContext caller, string? displayName) {
    if caller.role != ROLE_TEAM_MEMBER {
        return;
    }
    string name = displayName is string ? displayName : caller.userId;
    sql:ExecutionResult|error inserted = dbClient->execute(
        `INSERT INTO team_member (id, name, email, created_at)
         VALUES (${caller.userId}, ${name}, ${name}, ${nowTimestamp()})
         ON CONFLICT (id) DO NOTHING`);
    if inserted is error {
        log:printError("failed to auto-provision team_member record", 'error = inserted, userId = caller.userId);
    }
}
