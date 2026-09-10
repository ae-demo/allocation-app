import { useCallback, useEffect, useState, type JSX } from "react";
import { useParams } from "react-router";
import { useAppNavigate as useNavigate } from "../hooks/useAppNavigate";
import {
  Alert,
  AppBreadcrumbs,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  ListingTable,
  PageContent,
  PageTitle,
  Stack,
  Typography,
} from "@wso2/oxygen-ui";
import { Plus } from "@wso2/oxygen-ui-icons-react";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { Allocation, AllocationRequest, Customer, Engagement } from "../types";

export default function EngagementDetail(): JSX.Element {
  const { engagementId = "" } = useParams();
  const navigate = useNavigate();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [requests, setRequests] = useState<AllocationRequest[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const engagementRes = await api.getEngagement(engagementId);
    if (engagementRes.error) {
      setError(errorMessage(engagementRes.error, "Could not load this engagement."));
      return;
    }
    setEngagement(engagementRes.data);

    const [customerRes, requestsRes, allocationsRes] = await Promise.all([
      api.getCustomer(engagementRes.data.customerId),
      api.listAllocationRequests({ engagementId, limit: 100 }),
      api.listAllocations({ engagementId, limit: 100 }),
    ]);
    if (!customerRes.error) setCustomer(customerRes.data);
    if (!requestsRes.error) setRequests(requestsRes.data.data);
    if (!allocationsRes.error) setAllocations(allocationsRes.data.data);
  }, [engagementId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleStatus() {
    if (!engagement) return;
    setToggling(true);
    setActionError(null);
    const { data, error: apiError } =
      engagement.status === "Active" ? await api.closeEngagement(engagementId) : await api.reopenEngagement(engagementId);
    setToggling(false);
    if (apiError) {
      setActionError(errorMessage(apiError, "Could not update this engagement's status."));
      return;
    }
    setEngagement(data);
  }

  if (error) {
    return (
      <PageContent>
        <Alert severity="error">{error}</Alert>
      </PageContent>
    );
  }

  if (!engagement) {
    return (
      <PageContent>
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      </PageContent>
    );
  }

  const filledByRole = new Map<string, number>();
  for (const allocation of allocations) {
    if (allocation.status !== "Active") continue;
    filledByRole.set(allocation.role, (filledByRole.get(allocation.role) ?? 0) + 1);
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.BackButton onClick={() => navigate(customer ? `/customers/${customer.id}` : "/customers")}>
          Back
        </PageTitle.BackButton>
        <AppBreadcrumbs
          items={[
            { key: "customers", label: "Customers", onClick: () => navigate("/customers") },
            ...(customer
              ? [{ key: "customer", label: customer.name, onClick: () => navigate(`/customers/${customer.id}`) }]
              : []),
            { key: "engagement", label: engagement.name },
          ]}
        />
        <Stack direction="row" spacing={2} alignItems="center">
          <PageTitle.Header>{engagement.name}</PageTitle.Header>
          <Chip
            label={engagement.status}
            color={engagement.status === "Active" ? "success" : "default"}
            size="small"
          />
        </Stack>
      </PageTitle>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {engagement.startDate} – {engagement.endDate}
        {customer ? ` — ${customer.name}` : ""}
      </Typography>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Staffing plan
          </Typography>
          <ListingTable.Container>
            <ListingTable>
              <ListingTable.Head>
                <ListingTable.Row>
                  <ListingTable.Cell>Role</ListingTable.Cell>
                  <ListingTable.Cell>Target</ListingTable.Cell>
                  <ListingTable.Cell>Filled</ListingTable.Cell>
                </ListingTable.Row>
              </ListingTable.Head>
              <ListingTable.Body>
                {!engagement.staffingPlan || engagement.staffingPlan.length === 0 ? (
                  <ListingTable.Row>
                    <ListingTable.Cell colSpan={3}>
                      <ListingTable.EmptyState title="No staffing plan yet" />
                    </ListingTable.Cell>
                  </ListingTable.Row>
                ) : (
                  engagement.staffingPlan.map((line, i) => (
                    <ListingTable.Row key={i}>
                      <ListingTable.Cell>{line.role}</ListingTable.Cell>
                      <ListingTable.Cell>{line.targetHeadcount}</ListingTable.Cell>
                      <ListingTable.Cell>{filledByRole.get(line.role) ?? 0}</ListingTable.Cell>
                    </ListingTable.Row>
                  ))
                )}
              </ListingTable.Body>
            </ListingTable>
          </ListingTable.Container>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              disabled={engagement.status !== "Active"}
              onClick={() => navigate(`/engagements/${engagementId}/allocation-requests/new`)}
            >
              Submit Allocation Request
            </Button>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Requests on this engagement
          </Typography>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {requests.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No allocation requests yet.
              </Typography>
            ) : (
              requests.map((request) => (
                <Typography variant="body2" key={request.id}>
                  {request.role} · {request.utilizationPct}% · {request.status}
                  {request.status === "Rejected" && request.rejectionReason ? ` — ${request.rejectionReason}` : ""}
                </Typography>
              ))
            )}
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="outlined" disabled={toggling} onClick={toggleStatus}>
              {engagement.status === "Active" ? "Close Engagement" : "Reopen Engagement"}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </PageContent>
  );
}
