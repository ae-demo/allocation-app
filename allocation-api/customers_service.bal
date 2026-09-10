import ballerina/http;
import ballerina/sql;
import ballerina/uuid;

service /customers on apiListener {

    // Any signed-in caller may view customers (domain-model.md: view is unrestricted;
    // only edit/close/reopen is owner-gated).
    resource function get .(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            int 'limit = 20, int offset = 0) returns CustomerPage|http:Unauthorized|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        int lim = clampLimit('limit);
        int off = clampOffset(offset);

        int total = check dbClient->queryRow(`SELECT COUNT(*) FROM customer`);
        stream<CustomerRow, sql:Error?> rows = dbClient->query(
            `SELECT id, name, contact_name AS "contactName", contact_email AS "contactEmail",
                    contact_phone AS "contactPhone", created_by AS "createdBy"
             FROM customer ORDER BY created_at LIMIT ${lim} OFFSET ${off}`);
        CustomerRow[] rowList = check from CustomerRow row in rows select row;
        Customer[] data = from CustomerRow row in rowList select toCustomer(row);
        return {count: total, next: nextUri("/customers", lim, off, total), previous: previousUri("/customers", lim, off), data: data};
    }

    resource function post .(@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            CustomerInput payload) returns http:Created|http:BadRequest|http:Unauthorized|http:Forbidden|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        if caller.role != ROLE_ACCOUNT_MANAGER {
            return forbidden("only an Account Manager may create a customer");
        }
        if payload.name.trim() == "" || payload.contactName.trim() == "" || payload.contactEmail.trim() == "" {
            return badRequest("name, contactName and contactEmail are required");
        }

        string id = uuid:createRandomUuid();
        string? contactPhone = payload?.contactPhone;
        sql:ExecutionResult|error result = dbClient->execute(
            `INSERT INTO customer (id, name, contact_name, contact_email, contact_phone, created_by, created_at)
             VALUES (${id}, ${payload.name}, ${payload.contactName}, ${payload.contactEmail},
                     ${contactPhone}, ${caller.userId}, ${nowTimestamp()})`);
        if result is error {
            return badRequest("could not create customer: " + result.message());
        }
        return <http:Created>{body: toCustomer({id: id, name: payload.name, contactName: payload.contactName, contactEmail: payload.contactEmail, contactPhone: contactPhone, createdBy: caller.userId})};
    }

    resource function get [string customerId](@http:Header string? x\-user\-id, @http:Header string? x\-user\-name)
            returns Customer|http:NotFound|http:Unauthorized|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        CustomerRow|http:NotFound|error row = fetchCustomerRow(customerId);
        if row is http:NotFound || row is error {
            return row;
        }
        return toCustomer(row);
    }

    resource function put [string customerId](@http:Header string? x\-user\-id, @http:Header string? x\-user\-name,
            CustomerInput payload) returns Customer|http:BadRequest|http:Unauthorized|http:Forbidden|http:NotFound|error {
        CallerContext|http:Unauthorized caller = resolveCaller(x\-user\-id, x\-user\-name);
        if caller is http:Unauthorized {
            return caller;
        }
        CustomerRow|http:NotFound|error existing = fetchCustomerRow(customerId);
        if existing is http:NotFound || existing is error {
            return existing;
        }
        if caller.role != ROLE_ACCOUNT_MANAGER || caller.userId != existing.createdBy {
            return forbidden("only the creating Account Manager may edit this customer");
        }
        if payload.name.trim() == "" || payload.contactName.trim() == "" || payload.contactEmail.trim() == "" {
            return badRequest("name, contactName and contactEmail are required");
        }

        string? contactPhone = payload?.contactPhone;
        sql:ExecutionResult|error result = dbClient->execute(
            `UPDATE customer SET name = ${payload.name}, contact_name = ${payload.contactName},
                    contact_email = ${payload.contactEmail}, contact_phone = ${contactPhone}
             WHERE id = ${customerId}`);
        if result is error {
            return badRequest("could not update customer: " + result.message());
        }
        return toCustomer({id: customerId, name: payload.name, contactName: payload.contactName, contactEmail: payload.contactEmail, contactPhone: contactPhone, createdBy: existing.createdBy});
    }
}

function fetchCustomerRow(string customerId) returns CustomerRow|http:NotFound|error {
    CustomerRow|error row = dbClient->queryRow(
        `SELECT id, name, contact_name AS "contactName", contact_email AS "contactEmail",
                contact_phone AS "contactPhone", created_by AS "createdBy"
         FROM customer WHERE id = ${customerId}`);
    if row is sql:NoRowsError {
        return notFound("customer not found");
    }
    if row is error {
        return row;
    }
    return row;
}

function toCustomer(CustomerRow row) returns Customer => {
    id: row.id,
    name: row.name,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone
};
