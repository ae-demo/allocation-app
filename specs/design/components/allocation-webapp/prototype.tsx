import { useState, type ReactNode } from "react";
import {
  Alert, AppShell, Badge, Breadcrumbs, Button, Detail, Dialog, EmptyState, Field, Filters, Form,
  Heading, Link, Screen, Section, Stat, StatGroup, Table, Tabs, Text, ValidationSummary,
  defineApp, useCollection, useDisplayState, useNav, useParams, useRole,
} from "@wso2/prototype-kit";

interface Engagement {
  id: string;
  kind: "Customer" | "Internal" | "Marketing Event";
  type: string;
  account: string;
  code: string;
  startDate: string;
  endDate: string;
  requestStatus: string;
  engagementStatus: string;
  businessUnit: string;
  country: string;
  address: string;
  scope: string;
  crmLineItem: string;
  consultantNames: string;
}

interface Allocation {
  id: string;
  engagementId: string | null;
  engagementAccount: string;
  consultantEmail: string;
  consultantName: string;
  allocationType: string;
  startDate: string;
  endDate: string;
  clearanceStatus: string;
  travel: "Yes" | "No";
  comment: string;
  isHourly: boolean;
  startTime?: string;
  endTime?: string;
  timeZone?: string;
}

interface PartnerConsultant {
  id: string;
  partner: string;
  firstName: string;
  lastName: string;
  country: string;
  personalEmail: string;
  mobileNumber: string;
  status: "Active" | "Left";
}

interface AllocationType {
  id: string;
  name: string;
  engagementType: string;
  department: string;
  defaultCode: string;
  suffix: string;
  notify: boolean;
}

interface AccessRole {
  id: string;
  name: string;
  grants: string;
}

interface ReportRow {
  id: string;
  consultantEmail: string;
  engagementType: string;
  code: string;
  businessUnit: string;
  days: number;
  hours: number;
  account: string;
  glCode: string;
}

const engagements: Engagement[] = [
  {
    id: "ENG-1021", kind: "Customer", type: "Paid", account: "Acme Corp", code: "ENG-1021",
    startDate: "2026-11-01", endDate: "2027-02-01", requestStatus: "In Progress", engagementStatus: "Confirmed",
    businessUnit: "Consulting", country: "Singapore", address: "1 Raffles Place",
    scope: "Platform migration advisory using Kubernetes", crmLineItem: "Migration Advisory",
    consultantNames: "jane.doe@company.com",
  },
  {
    id: "ENG-1033", kind: "Customer", type: "Non-Paid Pre Sale", account: "Riverside Labs", code: "ENG-1033",
    startDate: "2026-10-15", endDate: "2026-12-15", requestStatus: "New", engagementStatus: "Pending",
    businessUnit: "Delivery", country: "United States", address: "200 Market St",
    scope: "Pre-sale technical assessment", crmLineItem: "Riverside Assessment",
    consultantNames: "",
  },
  {
    id: "INT-204", kind: "Internal", type: "Internal Engagement", account: "Organization", code: "INT-204",
    startDate: "2026-09-01", endDate: "2026-12-31", requestStatus: "Updated", engagementStatus: "In Progress",
    businessUnit: "Delivery", country: "Sri Lanka", address: "Colombo HQ",
    scope: "Internal platform tooling", crmLineItem: "",
    consultantNames: "john.smith@company.com",
  },
  {
    id: "MKT-110", kind: "Marketing Event", type: "Marketing Event", account: "Organization", code: "MKT-110",
    startDate: "2026-11-10", endDate: "2026-11-12", requestStatus: "Pending Approval", engagementStatus: "Pending",
    businessUnit: "Consulting", country: "Singapore", address: "Marina Bay Sands",
    scope: "Platform Hackathon", crmLineItem: "",
    consultantNames: "",
  },
];

const allocations: Allocation[] = [
  {
    id: "alloc-1", engagementId: "ENG-1021", engagementAccount: "Acme Corp",
    consultantEmail: "jane.doe@company.com", consultantName: "Jane Doe", allocationType: "Billable",
    startDate: "2026-11-01", endDate: "2027-02-01", clearanceStatus: "Confirmed", travel: "No",
    comment: "Lead consultant", isHourly: false,
  },
  {
    id: "alloc-2", engagementId: "ENG-1033", engagementAccount: "Riverside Labs",
    consultantEmail: "john.smith@company.com", consultantName: "John Smith", allocationType: "Billable",
    startDate: "2026-10-15", endDate: "2026-12-15", clearanceStatus: "Clearance In Progress", travel: "No",
    comment: "", isHourly: false,
  },
  {
    id: "default-1", engagementId: null, engagementAccount: "",
    consultantEmail: "jane.doe@company.com", consultantName: "Jane Doe", allocationType: "Bench",
    startDate: "2026-10-01", endDate: "2026-12-31", clearanceStatus: "Confirmed", travel: "No",
    comment: "Default", isHourly: false,
  },
];

const partnerConsultants: PartnerConsultant[] = [
  { id: "p-1", partner: "Acme Partners", firstName: "Alex", lastName: "Reed", country: "Singapore", personalEmail: "alex.reed@example.com", mobileNumber: "+6591234567", status: "Active" },
  { id: "p-2", partner: "Delta Staffing", firstName: "Priya", lastName: "Nair", country: "India", personalEmail: "priya.nair@example.com", mobileNumber: "+919812345678", status: "Left" },
];

const allocationTypes: AllocationType[] = [
  { id: "at-1", name: "Billable", engagementType: "Paid", department: "Consulting", defaultCode: "ENG", suffix: "", notify: true },
  { id: "at-2", name: "Bench", engagementType: "Internal Engagement", department: "Delivery", defaultCode: "INT-BENCH", suffix: "-B", notify: false },
];

const accessRoles: AccessRole[] = [
  { id: "role-requester", name: "Requester", grants: "engagements:create, engagements:read, engagements:update, engagements:manage-status" },
  { id: "role-approver", name: "Approver", grants: "approvals:review, approvals:approve" },
  { id: "role-allocation-manager", name: "AllocationManager", grants: "allocations:allocate, allocations:read, allocations:manage-clearance, engagements:read, engagements:manage-status" },
  { id: "role-team-manager", name: "TeamManager", grants: "allocations:manage-team, allocations:read" },
  { id: "role-finance-analyst", name: "FinanceAnalyst", grants: "dashboard:read, reports:read, reports:export" },
  { id: "role-administrator", name: "Administrator", grants: "allocation-types:manage, partner-consultants:manage, access-roles:read" },
];

const reportRows: ReportRow[] = [
  { id: "r-1", consultantEmail: "jane.doe@company.com", engagementType: "Paid", code: "ENG-1021", businessUnit: "Consulting", days: 92, hours: 736, account: "Acme Corp", glCode: "GL-100" },
  { id: "r-2", consultantEmail: "john.smith@company.com", engagementType: "Non-Paid Pre Sale", code: "ENG-1033", businessUnit: "Delivery", days: 45, hours: 360, account: "Riverside Labs", glCode: "GL-220" },
];

const suggestedSkills = ["Kubernetes", "GraphQL", "Stakeholder management"];

const userByRole: Record<string, { name: string; email: string }> = {
  Requester: { name: "Olivia Grant", email: "olivia.grant@company.com" },
  Approver: { name: "Priya Nair", email: "priya.nair@company.com" },
  AllocationManager: { name: "Mark Chen", email: "mark.chen@company.com" },
  TeamManager: { name: "Tom Alvarez", email: "tom.alvarez@company.com" },
  FinanceAnalyst: { name: "Fay Watanabe", email: "fay.watanabe@company.com" },
  Administrator: { name: "Amara Osei", email: "amara.osei@company.com" },
};

const homeByRole: Record<string, string> = {
  Requester: "screen.engagements-list",
  Approver: "screen.approval-queue",
  AllocationManager: "screen.allocations-list",
  TeamManager: "screen.team-timeline",
  FinanceAnalyst: "screen.dashboard",
  Administrator: "screen.allocation-types",
};

const navByRole: Record<string, { id: string; label: string; to: string }[]> = {
  Requester: [{ id: "nav.engagements", label: "Engagements", to: "screen.engagements-list" }],
  Approver: [{ id: "nav.approvals", label: "Approvals", to: "screen.approval-queue" }],
  AllocationManager: [{ id: "nav.allocations", label: "Allocations", to: "screen.allocations-list" }],
  TeamManager: [{ id: "nav.team", label: "Team Allocations", to: "screen.team-timeline" }],
  FinanceAnalyst: [
    { id: "nav.dashboard", label: "Dashboard", to: "screen.dashboard" },
    { id: "nav.reports", label: "Reports", to: "screen.consultant-report" },
  ],
  Administrator: [
    { id: "nav.alloc-types", label: "Allocation Types", to: "screen.allocation-types" },
    { id: "nav.partners", label: "Partner Consultants", to: "screen.partner-consultants" },
    { id: "nav.roles", label: "Access Roles", to: "screen.access-roles" },
  ],
};

function Shell({ children }: { children: ReactNode }) {
  const role = useRole();
  const user = userByRole[role] ?? userByRole.Requester;
  return (
    <AppShell
      id="shell"
      product="Allocations App"
      user={{ ...user, role }}
      nav={navByRole[role] ?? []}
      account="screen.account"
      settings="screen.settings"
      signOut="screen.signed-out"
    >
      {children}
    </AppShell>
  );
}

function EngagementsList() {
  const state = useDisplayState();
  const col = useCollection<Engagement>("engagements");
  const items = state === "state.empty" ? [] : col.items.filter((e) => e.kind === "Customer" || e.kind === "Internal");
  return (
    <Shell>
      <Heading
        id="heading.engagements"
        text="Engagements"
        actions={<Button id="btn.raise" label="Raise Engagement" emphasis="primary" to="screen.raise-engagement" />}
      />
      {state === "state.failed" && (
        <Alert id="alert.engagements-failed" tone="error" title="Could not load engagements" text="Try refreshing in a moment." />
      )}
      <Filters id="filters.engagements">
        <Field id="field.search" label="Search" name="search" />
        <Field id="field.type" label="Type" type="select" options={["All", "Paid", "Non-Paid Pre Sale", "Internal Engagement"]} />
        <Field id="field.request-status" label="Request status" type="select" options={["All", "New", "Updated", "In Progress", "Completed", "Cancelled"]} />
      </Filters>
      <Section id="section.engagements" title="Engagements" count={items.length} subtitle="Every customer and internal engagement, newest first.">
        <Table
          id="table.engagements"
          columns={["Account", "Type", "Code", "Dates", { label: "Request Status", kind: "status" }, "Consultants"]}
          rows={items.map((e) => ({
            id: `engagement.${e.id}`,
            cells: [e.account, e.type, e.code, `${e.startDate} - ${e.endDate}`, e.consultantNames || "None"],
            status: { text: e.requestStatus, tone: e.requestStatus === "Completed" ? "success" : "info" },
            to: "screen.engagement-detail",
            params: { engagement: e.id },
          }))}
          empty={<EmptyState id="empty.engagements" title="No engagements yet" text="Raise one to get started." actions={<Button id="btn.raise-empty" label="Raise Engagement" emphasis="primary" to="screen.raise-engagement" />} />}
        />
      </Section>
    </Shell>
  );
}

function RaiseEngagementForm() {
  const state = useDisplayState();
  const navigate = useNav();
  const col = useCollection<Engagement>("engagements");
  return (
    <Shell>
      <Heading id="heading.raise" text="Raise Engagement" />
      {state === "state.validation-error" && (
        <ValidationSummary id="validation.raise" issues={["Start date is required", "Start date must be on or before the end date"]} />
      )}
      <Form
        id="form.raise"
        onSubmit={(values) => {
          const id = col.create({
            kind: values.type === "Internal Engagement" ? "Internal" : values.type === "Marketing Event" ? "Marketing Event" : "Customer",
            type: values.type ?? "Paid",
            account: values.account ?? "Acme Corp",
            code: `ENG-${1100 + col.items.length}`,
            startDate: values.startDate ?? "2026-11-01",
            endDate: values.endDate ?? "2027-01-01",
            requestStatus: "New",
            engagementStatus: "Pending",
            businessUnit: values.businessUnit ?? "Consulting",
            country: values.country ?? "",
            address: values.address ?? "",
            scope: values.scope ?? "",
            crmLineItem: "",
            consultantNames: "",
          });
          navigate.go("screen.engagement-detail", { engagement: id });
        }}
        actions={
          <>
            <Button id="btn.raise-cancel" label="Cancel" to="screen.engagements-list" />
            <Button id="btn.raise-submit" label="Submit" emphasis="primary" submit />
          </>
        }
      >
        <Field id="field.engagement-type" label="Engagement type" name="type" type="select" required
          options={["Paid", "Paid Pre Sale", "Paid Post Sale", "Non-Paid Pre Sale", "Non-Paid Post Sale", "Internal Engagement", "Marketing Event"]} />
        <Field id="field.account" label="Account" name="account" type="select" options={["Acme Corp", "Riverside Labs", "Organization"]} />
        <Field id="field.country" label="Country" name="country" />
        <Field id="field.address" label="Address" name="address" />
        <Field id="field.scope" label="Scope" name="scope" type="textarea" />
        <Field id="field.start-date" label="Start date" name="startDate" type="date" required />
        <Field id="field.end-date" label="End date" name="endDate" type="date" required />
        <Field id="field.business-unit" label="Funding business unit" name="businessUnit" type="select" options={["Consulting", "Delivery"]} />
      </Form>
    </Shell>
  );
}

function EngagementDetail() {
  const { engagement: id } = useParams();
  const col = useCollection<Engagement>("engagements");
  const allocCol = useCollection<Allocation>("allocations");
  const engagement = (id ? col.get(id) : undefined) ?? col.items[0]!;
  const its = allocCol.items.filter((a) => a.engagementId === engagement.id);
  return (
    <Shell>
      <Breadcrumbs id="breadcrumbs.detail" items={[
        { id: "crumb.list", label: "Engagements", to: "screen.engagements-list" },
        { id: "crumb.current", label: engagement.code },
      ]} />
      <Heading id="heading.detail" text={`Engagement ${engagement.code}`} />
      <Detail
        id="detail.engagement"
        fields={[
          { label: "Account", value: engagement.account },
          { label: "Type", value: engagement.type },
          { label: "Dates", value: `${engagement.startDate} - ${engagement.endDate}` },
          { label: "Scope", value: engagement.scope },
          { label: "Request status", value: engagement.requestStatus },
          { label: "Engagement status", value: engagement.engagementStatus },
        ]}
      />
      {engagement.crmLineItem && <Link id="link.crm" label="Go to CRM record" />}
      <Section id="section.consultants" title="Consultants" count={its.length}>
        <Table
          id="table.consultants"
          columns={["Consultant", "Dates", { label: "Clearance", kind: "status" }]}
          rows={its.map((a) => ({
            id: `consultant.${a.id}`,
            cells: [a.consultantName, `${a.startDate} - ${a.endDate}`],
            status: { text: a.clearanceStatus, tone: a.clearanceStatus === "Confirmed" ? "success" : "warning" },
          }))}
          empty={<EmptyState id="empty.consultants" title="No consultants allocated yet" text="An allocation manager allocates consultants from the Allocations area." />}
        />
      </Section>
      <Button id="btn.edit" label="Edit" to="screen.edit-engagement" params={{ engagement: engagement.id }} />
      <Button id="btn.refresh-dates" label="Fetch New Dates from CRM" onPress={() => col.update(engagement.id, { endDate: "2027-03-01" })} />
      <Button id="btn.complete" label="Complete" onPress={() => col.update(engagement.id, { requestStatus: "Completed" })} />
      <Button id="btn.cancel" label="Cancel" emphasis="danger" onPress={() => col.update(engagement.id, { engagementStatus: "Cancelled", requestStatus: "Cancelled" })} />
    </Shell>
  );
}

function EditEngagementForm() {
  const { engagement: id } = useParams();
  const col = useCollection<Engagement>("engagements");
  const navigate = useNav();
  const engagement = (id ? col.get(id) : undefined) ?? col.items[0]!;
  return (
    <Shell>
      <Heading id="heading.edit" text="Edit Engagement" />
      <Form
        id="form.edit"
        onSubmit={(values) => {
          col.update(engagement.id, {
            country: values.country ?? engagement.country,
            address: values.address ?? engagement.address,
            scope: values.scope ?? engagement.scope,
            startDate: values.startDate ?? engagement.startDate,
            endDate: values.endDate ?? engagement.endDate,
            requestStatus: "Updated",
          });
          navigate.go("screen.engagement-detail", { engagement: engagement.id });
        }}
        actions={
          <>
            <Button id="btn.edit-cancel" label="Cancel" to="screen.engagement-detail" params={{ engagement: engagement.id }} />
            <Button id="btn.edit-save" label="Save" emphasis="primary" submit />
          </>
        }
      >
        <Field id="field.edit-country" label="Country" name="country" defaultValue={engagement.country} />
        <Field id="field.edit-address" label="Address" name="address" defaultValue={engagement.address} />
        <Field id="field.edit-scope" label="Scope" name="scope" type="textarea" defaultValue={engagement.scope} />
        <Field id="field.edit-start" label="Start date" name="startDate" type="date" defaultValue={engagement.startDate} />
        <Field id="field.edit-end" label="End date" name="endDate" type="date" defaultValue={engagement.endDate} />
      </Form>
    </Shell>
  );
}

function ApprovalQueue() {
  const state = useDisplayState();
  const col = useCollection<Engagement>("engagements");
  const pending = state === "state.empty" ? [] : col.items.filter((e) => e.requestStatus === "Pending Approval");
  const internal = pending.filter((e) => e.kind === "Internal");
  const events = pending.filter((e) => e.kind === "Marketing Event");
  return (
    <Shell>
      <Heading id="heading.approvals" text="Approval Queue" />
      <Tabs id="tabs.approvals" tabs={[
        {
          id: "tab.internal", label: "Internal Engagements", content: (
            <Table id="table.internal-approvals" columns={["Name", "Business Unit", "Dates", { label: "Request Status", kind: "status" }]}
              rows={internal.map((e) => ({
                id: `pending.${e.id}`, cells: [e.account, e.businessUnit, `${e.startDate} - ${e.endDate}`],
                status: { text: e.requestStatus, tone: "warning" }, to: "screen.approval-detail", params: { engagement: e.id },
              }))}
              empty={<EmptyState id="empty.internal-approvals" title="Nothing pending" text="Internal engagements awaiting approval appear here." />} />
          ),
        },
        {
          id: "tab.events", label: "Marketing Events", content: (
            <Table id="table.event-approvals" columns={["Name", "Business Unit", "Dates", { label: "Request Status", kind: "status" }]}
              rows={events.map((e) => ({
                id: `pending.${e.id}`, cells: [e.scope, e.businessUnit, `${e.startDate} - ${e.endDate}`],
                status: { text: e.requestStatus, tone: "warning" }, to: "screen.approval-detail", params: { engagement: e.id },
              }))}
              empty={<EmptyState id="empty.event-approvals" title="Nothing pending" text="Marketing events awaiting approval appear here." />} />
          ),
        },
      ]} />
    </Shell>
  );
}

function ApprovalDetail() {
  const { engagement: id } = useParams();
  const col = useCollection<Engagement>("engagements");
  const navigate = useNav();
  const engagement = (id ? col.get(id) : undefined) ?? col.items.find((e) => e.requestStatus === "Pending Approval") ?? col.items[0]!;
  return (
    <Shell>
      <Heading id="heading.approve" text="Approve Engagement / Event" />
      <Form
        id="form.approve"
        onSubmit={() => {
          col.update(engagement.id, { requestStatus: "Approved" });
          navigate.go("screen.approval-queue");
        }}
        actions={
          <>
            <Button id="btn.update" label="Update" onPress={() => col.update(engagement.id, { requestStatus: "Updated" })} />
            <Button id="btn.confirm-approve" label="Confirm and Approve" emphasis="primary" submit />
          </>
        }
      >
        <Field id="field.business-unit-a" label="Business unit" name="businessUnit" type="select" options={["Consulting", "Delivery"]} defaultValue={engagement.businessUnit} />
        <Field id="field.country-a" label="Country" name="country" defaultValue={engagement.country} />
        <Field id="field.start-date-a" label="Start date" name="startDate" type="date" defaultValue={engagement.startDate} />
        <Field id="field.end-date-a" label="End date" name="endDate" type="date" defaultValue={engagement.endDate} />
      </Form>
    </Shell>
  );
}

function AllocationsList() {
  const state = useDisplayState();
  const col = useCollection<Allocation>("allocations");
  const items = state === "state.empty" ? [] : col.items.filter((a) => a.engagementId);
  return (
    <Shell>
      <Heading id="heading.allocations" text="Allocations" />
      <Filters id="filters.allocations">
        <Field id="field.alloc-account" label="Account" />
        <Field id="field.alloc-clearance" label="Clearance status" type="select" options={["All", "Ready for Clearance", "Clearance In Progress", "Confirmed"]} />
      </Filters>
      <Section id="section.allocations" title="Allocations" count={items.length}>
        <Table
          id="table.allocations"
          columns={["Consultant", "Account", "Allocation Type", "Dates", { label: "Clearance", kind: "status" }]}
          rows={items.map((a) => ({
            id: `allocation.${a.id}`,
            cells: [a.consultantName, a.engagementAccount, a.allocationType, `${a.startDate} - ${a.endDate}`],
            status: { text: a.clearanceStatus, tone: a.clearanceStatus === "Confirmed" ? "success" : "warning" },
            to: "screen.allocation-workspace",
            params: { engagement: a.engagementId ?? "" },
          }))}
          empty={<EmptyState id="empty.allocations" title="No allocations yet" text="Allocate a consultant from an engagement." />}
        />
      </Section>
    </Shell>
  );
}

function AllocationWorkspace() {
  const { engagement: id } = useParams();
  const engagements_ = useCollection<Engagement>("engagements");
  const allocCol = useCollection<Allocation>("allocations");
  const engagement = (id ? engagements_.get(id) : undefined) ?? engagements_.items[0]!;
  const its = allocCol.items.filter((a) => a.engagementId === engagement.id);
  return (
    <Shell>
      <Breadcrumbs id="breadcrumbs.workspace" items={[
        { id: "crumb.alloc-list", label: "Allocations", to: "screen.allocations-list" },
        { id: "crumb.workspace", label: engagement.code },
      ]} />
      <Heading id="heading.workspace" text={`Allocation Workspace \u2014 ${engagement.code}`} />
      <Detail id="detail.workspace" fields={[
        { label: "Account", value: engagement.account },
        { label: "Type", value: engagement.type },
        { label: "Dates", value: `${engagement.startDate} - ${engagement.endDate}` },
      ]} />
      <Section id="section.workspace-allocations" title="Consultants" count={its.length}>
        <Table
          id="table.workspace-allocations"
          columns={["Consultant", "Dates", { label: "Clearance", kind: "status" }, "Travel", "Comment"]}
          rows={its.map((a) => ({
            id: `workspace.${a.id}`,
            cells: [a.consultantName, `${a.startDate} - ${a.endDate}`, a.travel, a.comment],
            status: { text: a.clearanceStatus, tone: a.clearanceStatus === "Confirmed" ? "success" : "warning" },
          }))}
          empty={<EmptyState id="empty.workspace-allocations" title="No one allocated yet" text="Find or allocate a consultant." />}
        />
      </Section>
      <Button id="btn.find-consultant" label="Find Consultant" to="screen.consultant-search" params={{ engagement: engagement.id }} />
      <Button id="btn.allocate-consultant" label="Allocate Consultant" emphasis="primary" to="screen.add-allocation" params={{ engagement: engagement.id }} />
      <Button id="btn.workspace-complete" label="Complete Request" onPress={() => engagements_.update(engagement.id, { requestStatus: "Completed" })} />
    </Shell>
  );
}

function ConsultantSearch() {
  const { engagement: id } = useParams();
  return (
    <Shell>
      <Heading id="heading.search" text="Find a Consultant" />
      <Tabs id="tabs.search" tabs={[
        {
          id: "tab.by-email", label: "By Email", content: (
            <Filters id="filters.by-email">
              <Field id="field.search-email" label="Search by email" />
              <Button id="btn.search-email" label="Search" />
            </Filters>
          ),
        },
        { id: "tab.by-team", label: "By Team", content: <Field id="field.by-team" label="Team" type="select" options={["Consulting / Delivery / Platform"]} /> },
        { id: "tab.by-skill", label: "By Skill", content: <Text id="text.by-skill" text="Suggested skills below, from the engagement's scope." /> },
      ]} />
      <Section id="section.suggested-skills" title="Suggested skills" subtitle="From the engagement scope, suggested by the skill-suggestion agent.">
        {suggestedSkills.map((s) => (
          <Badge key={s} id={`badge.${s.replace(/\s+/g, "-").toLowerCase()}`} label={s} />
        ))}
      </Section>
      <Table
        id="table.search-results"
        columns={["Name", "Email", "Skills"]}
        rows={[
          { id: "consultant.jane", cells: ["Jane Doe", "jane.doe@company.com", "Kubernetes, GraphQL"], to: "screen.add-allocation", params: { engagement: id ?? "ENG-1021", consultantEmail: "jane.doe@company.com" } },
        ]}
      />
    </Shell>
  );
}

function AddAllocationForm() {
  const { engagement: id, consultantEmail } = useParams();
  const engagements_ = useCollection<Engagement>("engagements");
  const allocCol = useCollection<Allocation>("allocations");
  const navigate = useNav();
  const engagement = (id ? engagements_.get(id) : undefined) ?? engagements_.items[0]!;
  return (
    <Shell>
      <Heading id="heading.add-allocation" text="Allocate Consultant" />
      <Form
        id="form.add-allocation"
        onSubmit={(values) => {
          allocCol.create({
            engagementId: engagement.id,
            engagementAccount: engagement.account,
            consultantEmail: values.consultantEmail ?? consultantEmail ?? "jane.doe@company.com",
            consultantName: values.consultantEmail ?? consultantEmail ?? "Jane Doe",
            allocationType: values.allocationType ?? "Billable",
            startDate: values.startDate ?? engagement.startDate,
            endDate: values.endDate ?? engagement.endDate,
            clearanceStatus: "Ready for Clearance",
            travel: (values.travelRequired as "Yes" | "No") ?? "No",
            comment: values.comment ?? "",
            isHourly: false,
          });
          navigate.go("screen.allocation-workspace", { engagement: engagement.id });
        }}
        actions={
          <>
            <Button id="btn.add-allocation-cancel" label="Cancel" to="screen.allocation-workspace" params={{ engagement: engagement.id }} />
            <Button id="btn.add-allocation-save" label="Save Allocation" emphasis="primary" submit />
          </>
        }
      >
        <Field id="field.consultant-email" label="Consultant email" name="consultantEmail" required defaultValue={consultantEmail} />
        <Field id="field.allocation-type" label="Allocation type" name="allocationType" type="select" options={["Billable", "Bench", "Engagement Overhead"]} />
        <Field id="field.alloc-start" label="Start date" name="startDate" type="date" required />
        <Field id="field.alloc-end" label="End date" name="endDate" type="date" required />
        <Field id="field.travel-required" label="Travel required" name="travelRequired" type="switch" />
        <Field id="field.tentative" label="Tentative" name="tentative" type="switch" />
        <Field id="field.alloc-comment" label="Comment" name="comment" type="textarea" />
      </Form>
    </Shell>
  );
}

function TeamTimeline() {
  const state = useDisplayState();
  const col = useCollection<Allocation>("allocations");
  const items = state === "state.empty" ? [] : col.items.filter((a) => !a.engagementId);
  return (
    <Shell>
      <Heading
        id="heading.team-timeline"
        text="Team Timeline"
        actions={
          <>
            <Button id="btn.bulk-upload" label="Bulk Upload" to="screen.bulk-upload" />
            <Button id="btn.add-team-allocation" label="Add Allocation" emphasis="primary" to="screen.add-team-allocation" />
          </>
        }
      />
      <Filters id="filters.team">
        <Field id="field.business-unit-t" label="Business unit" type="select" options={["Consulting", "Delivery"]} />
        <Field id="field.department-t" label="Department" type="select" options={["Delivery"]} />
        <Field id="field.team-t" label="Team" type="select" options={["Platform"]} />
      </Filters>
      <Section id="section.team-timeline" title="Default allocations" count={items.length}>
        <Table
          id="table.team-timeline"
          columns={["Member", "Allocation Type", "Dates", "Comment"]}
          rows={items.map((a) => ({
            id: `default.${a.id}`,
            cells: [a.consultantName, a.allocationType, `${a.startDate} - ${a.endDate}`, a.comment],
          }))}
          empty={<EmptyState id="empty.team-timeline" title="No default allocations" text="Add one, or upload a CSV." />}
        />
      </Section>
    </Shell>
  );
}

function AddTeamAllocationForm() {
  const col = useCollection<Allocation>("allocations");
  const navigate = useNav();
  return (
    <Shell>
      <Heading id="heading.add-team" text="Add Default Allocation" />
      <Form
        id="form.add-team"
        onSubmit={(values) => {
          col.create({
            engagementId: null,
            engagementAccount: "",
            consultantEmail: values.consultantEmail ?? "jane.doe@company.com",
            consultantName: values.consultantEmail ?? "Jane Doe",
            allocationType: values.allocationType ?? "Bench",
            startDate: values.startDate ?? "2026-10-01",
            endDate: values.endDate ?? "2026-10-31",
            clearanceStatus: "Confirmed",
            travel: "No",
            comment: values.comment ?? "",
            isHourly: false,
          });
          navigate.go("screen.team-timeline");
        }}
        actions={
          <>
            <Button id="btn.add-team-cancel" label="Cancel" to="screen.team-timeline" />
            <Button id="btn.add-team-save" label="Save" emphasis="primary" submit />
          </>
        }
      >
        <Field id="field.team-consultant" label="Consultant email" name="consultantEmail" required />
        <Field id="field.team-alloc-type" label="Allocation type" name="allocationType" type="select" options={["Bench", "Engagement Overhead"]} />
        <Field id="field.team-start" label="Start date" name="startDate" type="date" required />
        <Field id="field.team-end" label="End date" name="endDate" type="date" required />
        <Field id="field.team-comment" label="Comment" name="comment" type="textarea" />
      </Form>
    </Shell>
  );
}

function BulkUpload() {
  const state = useDisplayState();
  return (
    <Shell>
      <Heading id="heading.bulk" text="Bulk Upload Default Allocations" />
      <Text id="text.bulk-instructions" text="Upload a CSV: company username, team, start date, end date, allocation type name." />
      {state === "state.failed" ? (
        <Alert id="alert.bulk-failed" tone="error" title="Upload failed" text="Check the file and try again." />
      ) : (
        <Section id="section.bulk-errors" title="Row errors" count={1}>
          <Table
            id="table.bulk-errors"
            columns={["Row", "Username", "Start", "End", "Type", "Error"]}
            rows={[{ id: "bulk-error.4", cells: ["4", "j.lee", "2026-10-01", "2026-10-05", "Unknown", "Allocation type not found"] }]}
          />
        </Section>
      )}
      <Button id="btn.download-errors" label="Download Error File" />
      <Button id="btn.add-allocations" label="Add Allocations" emphasis="primary" />
    </Shell>
  );
}

function Dashboard() {
  const state = useDisplayState();
  return (
    <Shell>
      <Heading id="heading.dashboard" text="Dashboard" />
      <Filters id="filters.dashboard">
        <Field id="field.dash-bu" label="Business unit" type="select" options={["All", "Consulting", "Delivery"]} />
        <Field id="field.dash-date" label="As of" type="select" options={["Today", "Past date"]} />
      </Filters>
      {state === "state.failed" && (
        <Alert id="alert.dashboard-failed" tone="error" title="Could not load dashboard counts" text="Try again shortly." />
      )}
      <StatGroup>
        <Stat id="stat.paid" label="Paid" value="3" hint="of 5 total engagements" icon="Briefcase" tone="success" />
        <Stat id="stat.internal" label="Internal" value="2" hint="of 5 total engagements" icon="Building2" />
        <Stat id="stat.nonpaid" label="Non-paid" value="0" hint="of 5 total engagements" icon="Layers" />
      </StatGroup>
      <Section id="section.by-type" title="Paid allocations by allocation type">
        <Table id="table.by-type" columns={["Allocation Type", { label: "Count", kind: "number" }, { label: "Percentage", kind: "number" }]}
          rows={[{ id: "type.billable", cells: ["Billable", "3", "100"] }]} />
      </Section>
    </Shell>
  );
}

function ConsultantReport() {
  const state = useDisplayState();
  const col = useCollection<ReportRow>("reportRows");
  const items = state === "state.empty" ? [] : col.items;
  return (
    <Shell>
      <Heading id="heading.report" text="Consultant Allocations Report" actions={<Button id="btn.download-csv" label="Download CSV" />} />
      <Filters id="filters.report">
        <Field id="field.report-start" label="Start date" type="date" required />
        <Field id="field.report-end" label="End date" type="date" required />
        <Field id="field.report-consultant" label="Consultant email" />
        <Field id="field.report-types" label="Allocation types" type="select" options={["All", "Billable", "Bench"]} />
      </Filters>
      <Section id="section.report" title="Report" count={items.length}>
        <Table
          id="table.report"
          columns={["Consultant", "Engagement Type", "Code", "Business Unit", { label: "Days", kind: "number" }, { label: "Hours", kind: "number" }, "Account", "GL Code"]}
          rows={items.map((r) => ({
            id: `report.${r.id}`,
            cells: [r.consultantEmail, r.engagementType, r.code, r.businessUnit, String(r.days), String(r.hours), r.account, r.glCode],
          }))}
          empty={<EmptyState id="empty.report" title="No rows for this period" text="Run the report for a different period." />}
        />
      </Section>
    </Shell>
  );
}

function AllocationTypesSettings() {
  const col = useCollection<AllocationType>("allocationTypes");
  return (
    <Shell>
      <Heading id="heading.alloc-types" text="Allocation Types" actions={<Button id="btn.add-alloc-type" label="Add Allocation Type" emphasis="primary" to="screen.allocation-type-form" />} />
      <Tabs id="tabs.settings" tabs={[
        {
          id: "tab.alloc-types", label: "Allocation Types", content: (
            <Table
              id="table.alloc-types"
              columns={["Name", "Engagement Type", "Department", "Default Code", "Notify"]}
              rows={col.items.map((t) => ({
                id: `alloc-type.${t.id}`,
                cells: [t.name, t.engagementType, t.department, t.defaultCode, t.notify ? "Yes" : "No"],
                to: "screen.allocation-type-form",
                params: { allocationType: t.id },
              }))}
            />
          ),
        },
        { id: "tab.partners-link", label: "Partner Consultants", content: <Button id="btn.go-partners" label="Open Partner Consultants" to="screen.partner-consultants" /> },
        { id: "tab.roles-link", label: "Access Roles", content: <Button id="btn.go-roles" label="Open Access Roles" to="screen.access-roles" /> },
      ]} />
    </Shell>
  );
}

function AllocationTypeForm() {
  const { allocationType: id } = useParams();
  const col = useCollection<AllocationType>("allocationTypes");
  const navigate = useNav();
  const type = (id ? col.get(id) : undefined) ?? col.items[0]!;
  return (
    <Shell>
      <Heading id="heading.alloc-type-form" text="Allocation Type" />
      <Form
        id="form.alloc-type"
        onSubmit={(values) => {
          col.update(type.id, {
            name: values.name ?? type.name,
            defaultCode: values.defaultCode ?? type.defaultCode,
            suffix: values.suffix ?? type.suffix,
            department: values.department ?? type.department,
          });
          navigate.go("screen.allocation-types");
        }}
        actions={
          <>
            <Button id="btn.alloc-type-delete" label="Delete" emphasis="danger" onPress={() => { col.remove(type.id); navigate.go("screen.allocation-types"); }} />
            <Button id="btn.alloc-type-cancel" label="Cancel" to="screen.allocation-types" />
            <Button id="btn.alloc-type-save" label="Save" emphasis="primary" submit />
          </>
        }
      >
        <Field id="field.alloc-type-engagement" label="Engagement type" name="engagementType" type="select" options={["Paid", "Internal Engagement", "Marketing Event"]} defaultValue={type.engagementType} />
        <Field id="field.alloc-type-name" label="Name" name="name" required defaultValue={type.name} />
        <Field id="field.alloc-type-code" label="Default engagement code" name="defaultCode" required defaultValue={type.defaultCode} />
        <Field id="field.alloc-type-suffix" label="Code suffix" name="suffix" defaultValue={type.suffix} />
        <Field id="field.alloc-type-department" label="Department" name="department" defaultValue={type.department} />
        <Field id="field.alloc-type-notify" label="Notify to Allocations" name="notify" type="switch" defaultValue={type.notify ? "on" : "off"} />
      </Form>
    </Shell>
  );
}

function PartnerConsultantsSettings() {
  const col = useCollection<PartnerConsultant>("partnerConsultants");
  return (
    <Shell>
      <Heading id="heading.partners" text="Partner Consultants" actions={<Button id="btn.add-partner" label="Add Partner Consultant" emphasis="primary" to="screen.partner-consultant-form" />} />
      <Tabs id="tabs.partners" tabs={[
        { id: "tab.alloc-types-link", label: "Allocation Types", content: <Button id="btn.go-alloc-types" label="Open Allocation Types" to="screen.allocation-types" /> },
        {
          id: "tab.partners", label: "Partner Consultants", content: (
            <Table
              id="table.partners"
              columns={["Partner", "Name", "Country", { label: "Status", kind: "status" }]}
              rows={col.items.map((p) => ({
                id: `partner.${p.id}`,
                cells: [p.partner, `${p.firstName} ${p.lastName}`, p.country],
                status: { text: p.status, tone: p.status === "Active" ? "success" : "default" },
                to: "screen.partner-consultant-form",
                params: { partner: p.id },
              }))}
            />
          ),
        },
        { id: "tab.roles-link-2", label: "Access Roles", content: <Button id="btn.go-roles-2" label="Open Access Roles" to="screen.access-roles" /> },
      ]} />
    </Shell>
  );
}

function PartnerConsultantForm() {
  const { partner: id } = useParams();
  const col = useCollection<PartnerConsultant>("partnerConsultants");
  const navigate = useNav();
  const partner = (id ? col.get(id) : undefined) ?? col.items[0]!;
  return (
    <Shell>
      <Heading id="heading.partner-form" text="Partner Consultant" />
      <Form
        id="form.partner"
        onSubmit={(values) => {
          col.update(partner.id, {
            partner: values.partnerCompany ?? partner.partner,
            firstName: values.firstName ?? partner.firstName,
            lastName: values.lastName ?? partner.lastName,
            country: values.country ?? partner.country,
            status: (values.status as "Active" | "Left") ?? partner.status,
          });
          navigate.go("screen.partner-consultants");
        }}
        actions={
          <>
            <Button id="btn.partner-delete" label="Delete" emphasis="danger" onPress={() => { col.remove(partner.id); navigate.go("screen.partner-consultants"); }} />
            <Button id="btn.partner-cancel" label="Cancel" to="screen.partner-consultants" />
            <Button id="btn.partner-save" label="Save" emphasis="primary" submit />
          </>
        }
      >
        <Field id="field.partner-company" label="Partner company" name="partnerCompany" required defaultValue={partner.partner} />
        <Field id="field.partner-first" label="First name" name="firstName" required defaultValue={partner.firstName} />
        <Field id="field.partner-last" label="Last name" name="lastName" required defaultValue={partner.lastName} />
        <Field id="field.partner-country" label="Country" name="country" required defaultValue={partner.country} />
        <Field id="field.partner-email" label="Personal email (reference only)" name="personalEmail" defaultValue={partner.personalEmail} />
        <Field id="field.partner-mobile" label="Mobile number" name="mobileNumber" defaultValue={partner.mobileNumber} />
        <Field id="field.partner-status" label="Status" name="status" type="select" options={["Active", "Left"]} defaultValue={partner.status} />
      </Form>
    </Shell>
  );
}

function AccessRolesView() {
  const col = useCollection<AccessRole>("accessRoles");
  return (
    <Shell>
      <Heading id="heading.roles" text="Access Roles" />
      <Tabs id="tabs.roles" tabs={[
        { id: "tab.alloc-types-link-3", label: "Allocation Types", content: <Button id="btn.go-alloc-types-2" label="Open Allocation Types" to="screen.allocation-types" /> },
        { id: "tab.partners-link-2", label: "Partner Consultants", content: <Button id="btn.go-partners-2" label="Open Partner Consultants" to="screen.partner-consultants" /> },
        {
          id: "tab.roles", label: "Access Roles", content: (
            <Table id="table.roles" columns={["Role", "Granted Privileges"]}
              rows={col.items.map((r) => ({ id: `role.${r.id}`, cells: [r.name, r.grants] }))} />
          ),
        },
      ]} />
    </Shell>
  );
}

function Account() {
  const role = useRole();
  const user = userByRole[role] ?? userByRole.Requester;
  return (
    <Shell>
      <Heading id="heading.account" text="Account" />
      <Detail id="detail.account" fields={[
        { label: "Name", value: user.name },
        { label: "Email", value: user.email },
        { label: "Role", value: role },
      ]} />
    </Shell>
  );
}

function Settings() {
  const role = useRole();
  const navigate = useNav();
  return (
    <Shell>
      <Heading id="heading.settings" text="Settings" />
      <Form
        id="form.settings"
        onSubmit={() => navigate.go(homeByRole[role] ?? "screen.engagements-list")}
        actions={<Button id="btn.save-settings" label="Save settings" emphasis="primary" submit />}
      >
        <Field id="field.digest" label="Email me a daily digest" name="digest" type="switch" defaultValue="on" />
      </Form>
    </Shell>
  );
}

function SignedOut() {
  const role = useRole();
  const navigate = useNav();
  return (
    <Screen>
      <Heading id="heading.signed-out" text="You are signed out" />
      <Button id="btn.sign-in" label="Sign in" emphasis="primary" onPress={() => navigate.go(homeByRole[role] ?? "screen.engagements-list")} />
    </Screen>
  );
}

export default defineApp({
  screens: {
    "screen.engagements-list": EngagementsList,
    "screen.raise-engagement": RaiseEngagementForm,
    "screen.engagement-detail": EngagementDetail,
    "screen.edit-engagement": EditEngagementForm,
    "screen.approval-queue": ApprovalQueue,
    "screen.approval-detail": ApprovalDetail,
    "screen.allocations-list": AllocationsList,
    "screen.allocation-workspace": AllocationWorkspace,
    "screen.consultant-search": ConsultantSearch,
    "screen.add-allocation": AddAllocationForm,
    "screen.team-timeline": TeamTimeline,
    "screen.add-team-allocation": AddTeamAllocationForm,
    "screen.bulk-upload": BulkUpload,
    "screen.dashboard": Dashboard,
    "screen.consultant-report": ConsultantReport,
    "screen.allocation-types": AllocationTypesSettings,
    "screen.allocation-type-form": AllocationTypeForm,
    "screen.partner-consultants": PartnerConsultantsSettings,
    "screen.partner-consultant-form": PartnerConsultantForm,
    "screen.access-roles": AccessRolesView,
    "screen.account": Account,
    "screen.settings": Settings,
    "screen.signed-out": SignedOut,
  },
  data: {
    engagements,
    allocations,
    partnerConsultants,
    allocationTypes,
    accessRoles,
    reportRows,
  },
});
