import ballerina/os;

// Database wiring — envBindings from allocation-db (design.json). Every value has a
// safe local default so the service still builds and boots with no env vars set.
configurable string allocationDbHost = os:getEnv("ALLOCATION_DB_HOST");
configurable string allocationDbPortEnv = os:getEnv("ALLOCATION_DB_PORT");
configurable string allocationDbName = os:getEnv("ALLOCATION_DB_DBNAME");
configurable string allocationDbUser = os:getEnv("ALLOCATION_DB_USER");
configurable string allocationDbPassword = os:getEnv("ALLOCATION_DB_PASSWORD");

// SendGrid wiring — external dependency, credentials not yet configured in this
// environment. Empty values are expected and handled defensively in email.bal.
configurable string sendgridApiKey = os:getEnv("SENDGRID_API_KEY");
configurable string sendgridFromEmail = os:getEnv("SENDGRID_FROM_EMAIL");

// Thunder is not read here: the gateway already validates the caller's token before
// this service ever sees the request (api-management), so no THUNDER_* configurable
// is needed — this service trusts the injected X-User-Id header.

final string dbHost = allocationDbHost.trim() == "" ? "localhost" : allocationDbHost;
final string dbName = allocationDbName.trim() == "" ? "allocation" : allocationDbName;
final string dbUser = allocationDbUser.trim() == "" ? "postgres" : allocationDbUser;
final string dbPassword = allocationDbPassword;
final int dbPort = parsePort(allocationDbPortEnv);

function parsePort(string val) returns int {
    if val.trim() == "" {
        return 5432;
    }
    int|error parsed = int:fromString(val.trim());
    if parsed is int {
        return parsed;
    }
    return 5432;
}
