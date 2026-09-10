import { useEffect, useState, type JSX } from "react";
import { Alert, Box, Chip, CircularProgress, ListingTable, PageContent, PageTitle } from "@wso2/oxygen-ui";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { Allocation, Engagement } from "../types";

// allocation-api defaults /allocations to the caller's own rows when they are
// a Team Member (REQ-009c) — the webapp asks for no teamMemberId at all.
export default function MyAllocations(): JSX.Element {
  const [allocations, setAllocations] = useState<Allocation[] | null>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listAllocations({ limit: 100 })
      .then(({ data, error: apiError }) => {
        if (cancelled) return;
        if (apiError) throw apiError;
        setAllocations(data.data);
        const ids = Array.from(new Set(data.data.map((a) => a.engagementId)));
        return Promise.all(ids.map((id) => api.getEngagement(id)));
      })
      .then((results) => {
        if (cancelled || !results) return;
        setEngagements(results.filter((r) => !r.error).map((r) => r.data as Engagement));
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Could not load your allocations.")));
    return () => {
      cancelled = true;
    };
  }, []);

  const engagementName = (id: string) => engagements.find((e) => e.id === id)?.name ?? id;

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>My Allocations</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!allocations ? (
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
              {allocations.length === 0 ? (
                <ListingTable.Row>
                  <ListingTable.Cell colSpan={5}>
                    <ListingTable.EmptyState
                      title="No allocations yet"
                      description="You have no current or upcoming allocations."
                    />
                  </ListingTable.Cell>
                </ListingTable.Row>
              ) : (
                allocations.map((allocation) => (
                  <ListingTable.Row key={allocation.id}>
                    <ListingTable.Cell>{engagementName(allocation.engagementId)}</ListingTable.Cell>
                    <ListingTable.Cell>{allocation.role}</ListingTable.Cell>
                    <ListingTable.Cell>{allocation.utilizationPct}%</ListingTable.Cell>
                    <ListingTable.Cell>
                      {allocation.startDate} – {allocation.endDate}
                    </ListingTable.Cell>
                    <ListingTable.Cell>
                      <Chip
                        label={allocation.status}
                        color={allocation.status === "Active" ? "success" : "default"}
                        size="small"
                      />
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
