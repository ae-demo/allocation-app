import { useEffect, useMemo, useState, type JSX } from "react";
import { useAppNavigate as useNavigate } from "../hooks/useAppNavigate";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  ListingTable,
  PageContent,
  PageTitle,
  SearchBar,
} from "@wso2/oxygen-ui";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { Allocation, Engagement, TeamMember } from "../types";

export default function AllocationsOverview(): JSX.Element {
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState<Allocation[] | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listAllocations({ limit: 100 }), api.listTeamMembers({ limit: 100 }), api.listEngagements({ limit: 100 })])
      .then(([allocationsRes, teamMembersRes, engagementsRes]) => {
        if (cancelled) return;
        if (allocationsRes.error) throw allocationsRes.error;
        if (teamMembersRes.error) throw teamMembersRes.error;
        if (engagementsRes.error) throw engagementsRes.error;
        setAllocations(allocationsRes.data.data);
        setTeamMembers(teamMembersRes.data.data);
        setEngagements(engagementsRes.data.data);
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Could not load allocations.")));
    return () => {
      cancelled = true;
    };
  }, []);

  const teamMemberName = (id: string) => teamMembers.find((m) => m.id === id)?.name ?? id;
  const engagementName = (id: string) => engagements.find((e) => e.id === id)?.name ?? id;

  const rows = useMemo(() => {
    if (!allocations) return [];
    if (!search) return allocations;
    const needle = search.toLowerCase();
    return allocations.filter(
      (a) => teamMemberName(a.teamMemberId).toLowerCase().includes(needle) || engagementName(a.engagementId).toLowerCase().includes(needle),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocations, teamMembers, engagements, search]);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Allocations</PageTitle.Header>
        <PageTitle.Actions>
          <SearchBar
            placeholder="Search team member or engagement"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 280 }}
          />
        </PageTitle.Actions>
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
                <ListingTable.Cell>Team Member</ListingTable.Cell>
                <ListingTable.Cell>Engagement</ListingTable.Cell>
                <ListingTable.Cell>Role</ListingTable.Cell>
                <ListingTable.Cell>Utilization</ListingTable.Cell>
                <ListingTable.Cell>Dates</ListingTable.Cell>
                <ListingTable.Cell>Status</ListingTable.Cell>
              </ListingTable.Row>
            </ListingTable.Head>
            <ListingTable.Body>
              {rows.length === 0 ? (
                <ListingTable.Row>
                  <ListingTable.Cell colSpan={6}>
                    <ListingTable.EmptyState title="No allocations" description="Approve a request to see it here." />
                  </ListingTable.Cell>
                </ListingTable.Row>
              ) : (
                rows.map((allocation) => (
                  <ListingTable.Row
                    key={allocation.id}
                    clickable
                    onClick={() => navigate(`/allocations/${allocation.id}`)}
                  >
                    <ListingTable.Cell>{teamMemberName(allocation.teamMemberId)}</ListingTable.Cell>
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
