import ballerina/http;
import ballerina/time;

// Response helpers — one shared Error shape (openapi.yaml components/schemas/Error).

function unauthorized() returns http:Unauthorized {
    return {body: {code: 401, message: "unauthorized", description: "X-User-Id header is required"}};
}

function forbidden(string description) returns http:Forbidden {
    return {body: {code: 403, message: "forbidden", description: description}};
}

function notFound(string description) returns http:NotFound {
    return {body: {code: 404, message: "not found", description: description}};
}

function badRequest(string description) returns http:BadRequest {
    return {body: {code: 400, message: "bad request", description: description}};
}

// Pagination — envelope + relative-URI cursors, per openapi-conventions.

function clampLimit(int 'limit) returns int {
    if 'limit < 1 {
        return 20;
    }
    if 'limit > 100 {
        return 100;
    }
    return 'limit;
}

function clampOffset(int offset) returns int {
    if offset < 0 {
        return 0;
    }
    return offset;
}

function nextUri(string basePath, int 'limit, int offset, int count) returns string? {
    int nextOffset = offset + 'limit;
    if nextOffset >= count {
        return ();
    }
    return string `${basePath}?limit=${'limit}&offset=${nextOffset}`;
}

function previousUri(string basePath, int 'limit, int offset) returns string? {
    if offset <= 0 {
        return ();
    }
    int prevOffset = offset - 'limit;
    if prevOffset < 0 {
        prevOffset = 0;
    }
    return string `${basePath}?limit=${'limit}&offset=${prevOffset}`;
}

// Dates — every date field on the wire and in storage is a plain ISO-8601 "YYYY-MM-DD"
// string (lexical order matches calendar order), so comparisons are plain string ops.

function today() returns string {
    time:Utc now = time:utcNow();
    time:Civil civil = time:utcToCivil(now);
    return string `${civil.year}-${padTwo(civil.month)}-${padTwo(civil.day)}`;
}

function padTwo(int val) returns string {
    if val < 10 {
        return string `0${val}`;
    }
    return val.toString();
}

function nowTimestamp() returns string {
    return time:utcToString(time:utcNow());
}
