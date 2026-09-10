import ballerina/http;
import ballerina/log;
import ballerinax/sendgrid;

// Best-effort email notifications (REQ-014). SENDGRID_API_KEY / SENDGRID_FROM_EMAIL may
// be empty in this environment (external credentials not yet configured) — every call
// site here swallows failures and logs instead of propagating, so a SendGrid outage or
// missing credential never fails the HTTP response that triggered the notification.
function notify(string toEmail, string toName, string subject, string body) {
    if sendgridApiKey.trim() == "" || sendgridFromEmail.trim() == "" {
        log:printWarn("sendgrid not configured; skipping email notification", subject = subject, recipient = toEmail);
        return;
    }
    if toEmail.trim() == "" {
        log:printWarn("no recipient email available; skipping email notification", subject = subject);
        return;
    }

    sendgrid:Client|error sgClient = new ({auth: {token: sendgridApiKey}});
    if sgClient is error {
        log:printError("failed to create sendgrid client", 'error = sgClient);
        return;
    }

    sendgrid:SendEmailRequest emailRequest = {
        content: [{'type: "text/plain", value: body}],
        'from: {email: sendgridFromEmail, name: "Allocation App"},
        personalizations: [{to: [{email: toEmail, name: toName}]}],
        subject: subject
    };

    http:Response|error result = sgClient->sendMail(emailRequest);
    if result is error {
        log:printError("sendgrid send failed", 'error = result, recipient = toEmail, subject = subject);
    }
}

function notifyUsers(AppUserRow[] recipients, string subject, string body) {
    foreach AppUserRow recipient in recipients {
        notify(recipient.email, recipient.email, subject, body);
    }
}
