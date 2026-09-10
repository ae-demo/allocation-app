import { useEffect, useState, type JSX } from "react";
import { useAppNavigate as useNavigate } from "../hooks/useAppNavigate";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  ListingTable,
  MenuItem,
  PageContent,
  PageTitle,
  TextField,
} from "@wso2/oxygen-ui";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { AllocationRequest, Engagement } from "../types";

type StatusFilter = "Pending" | "Approved" | "Rejected" | "All";

const STATUS_COLOR: Record<AllocationRequest["status"], "warning" | "success" | "error"> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "error",
};

export default function AllocationRequests(): JSX.Element {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusFilter>("Pending");
  const [requests, setRequests] = useState<AllocationRequest[] | null>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRequests(null);
    Promise.all([
      api.listAllocationRequests(status === "All" ? { limit: 100 } : { status, limit: 100 }),
      api.listEngagements({ limit: 100 }),
    ])
      .then(([requestsRes, engagementsRes]) => {
        if (cancelled) return;
        if (requestsRes.error) throw requestsRes.error;
        if (engagementsRes.error) throw engagementsRes.error;
        setRequests(requestsRes.data.data);
        setEngagements(engagementsRes.data.data);
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Could not load allocation requests.")));
    return () => {
      cancelled = true;
    };
  }, [status]);

  const engagementName = (engagementId: string) =>
    engagements.find((e) => e.id === engagementId)?.name ?? engagementId;

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Allocation Requests</PageTitle.Header>
        <PageTitle.Actions>
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="All">All</MenuItem>
          </TextField>
        </PageTitle.Actions>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!requests ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ListingTable.Container>
          <ListingTable>
            <ListingTable.Head>
              <ListingTable.Row>
                <ListingTable.Cell>Engagement</ListingTable.Cell>
                <ListingTable.Cell>Role</ListingTable.Cell>
                <ListingTable.Cell>Utilization</ListingTable.Cell>
                <ListingTable.Cell>Dates</ListingTable.Cell>
                <ListingTable.Cell>Status</ListingTable.Cell>
              </ListingTable.Row>
            </ListingTable.Head>
            <ListingTable.Body>
              {requests.length === 0 ? (
                <ListingTable.Row>
                  <ListingTable.Cell colSpan={5}>
                    <ListingTable.EmptyState title="No allocation requests" description="Nothing matches this filter." />
                  </ListingTable.Cell>
                </ListingTable.Row>
              ) : (
                requests.map((request) => (
                  <ListingTable.Row
                    key={request.id}
                    clickable={request.status === "Pending"}
                    onClick={() =>
                      request.status === "Pending" && navigate(`/allocation-requests/${request.id}/assign`)
                    }
                  >
                    <ListingTable.Cell>{engagementName(request.engagementId)}</ListingTable.Cell>
                    <ListingTable.Cell>{request.role}</ListingTable.Cell>
                    <ListingTable.Cell>{request.utilizationPct}%</ListingTable.Cell>
                    <ListingTable.Cell>
                      {request.startDate} – {request.endDate}
                    </ListingTable.Cell>
                    <ListingTable.Cell>
                      <Chip label={request.status} color={STATUS_COLOR[request.status]} size="small" />
                    </ListingTable.Cell>
                  </ListingTable.Row>
                ))
              )}
            </ListingTable.Body>
          </ListingTable>
        </ListingTable.Container>
      )}
    </PageContent>
  );
}
