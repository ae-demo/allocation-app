import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

final postgresql:Client dbClient = check new (
    host = dbHost,
    username = dbUser,
    password = dbPassword,
    database = dbName,
    port = dbPort
);

final () schemaReady = check initSchema();

function initSchema() returns error? {
    // Role/identity: no directory is published for this project (security.json's
    // publicComponents is empty and it declares no directory dependency), so this
    // service owns its own per-caller role record, keyed by the opaque X-User-Id.
    // `email` is best-effort contact info for SendGrid notifications — the gateway
    // does not forward an email claim (api-management only forwards
    // X-User-Id/Groups/Name/Ou), so it is derived from X-User-Name when present.
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS app_user (
            user_id TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            email TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    `);

    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS customer (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            contact_name TEXT NOT NULL,
            contact_email TEXT NOT NULL,
            contact_phone TEXT,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    `);

    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS engagement (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL REFERENCES customer(id),
            name TEXT NOT NULL,
            description TEXT,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            status TEXT NOT NULL,
            owner_account_manager_id TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    `);

    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS staffing_plan_line (
            id TEXT PRIMARY KEY,
            engagement_id TEXT NOT NULL REFERENCES engagement(id),
            role TEXT NOT NULL,
            target_headcount INT NOT NULL
        )
    `);

    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS team_member (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            title TEXT,
            created_at TEXT NOT NULL
        )
    `);

    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS allocation_request (
            id TEXT PRIMARY KEY,
            engagement_id TEXT NOT NULL REFERENCES engagement(id),
            role TEXT NOT NULL,
            utilization_pct INT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            status TEXT NOT NULL,
            requested_by_account_manager_id TEXT NOT NULL,
            rejection_reason TEXT,
            created_at TEXT NOT NULL
        )
    `);

    // original_end_date is immutable once the allocation is created: REQ-008 gates
    // ending/modifying on the ORIGINAL end date, even after an update has already
    // moved end_date.
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS allocation (
            id TEXT PRIMARY KEY,
            allocation_request_id TEXT,
            engagement_id TEXT NOT NULL REFERENCES engagement(id),
            team_member_id TEXT NOT NULL,
            role TEXT NOT NULL,
            utilization_pct INT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            original_end_date TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    `);

    return;
}
