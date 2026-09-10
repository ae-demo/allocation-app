import { useEffect, useMemo, useState, type JSX } from "react";
import { useAppNavigate as useNavigate } from "../hooks/useAppNavigate";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  ListingTable,
  PageContent,
  PageTitle,
  SearchBar,
} from "@wso2/oxygen-ui";
import { Plus } from "@wso2/oxygen-ui-icons-react";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { TeamMember } from "../types";

export default function TeamMembers(): JSX.Element {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listTeamMembers({ limit: 100 })
      .then(({ data, error: apiError }) => {
        if (cancelled) return;
        if (apiError) throw apiError;
        setTeamMembers(data.data);
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Could not load team members.")));
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    if (!teamMembers) return [];
    if (!search) return teamMembers;
    const needle = search.toLowerCase();
    return teamMembers.filter((m) => m.name.toLowerCase().includes(needle) || m.email.toLowerCase().includes(needle));
  }, [teamMembers, search]);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Team Members</PageTitle.Header>
        <PageTitle.Actions>
          <SearchBar
            placeholder="Search team members"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate("/team-members/new")}>
            Add Team Member
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!teamMembers ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ListingTable.Container>
          <ListingTable>
            <ListingTable.Head>
              <ListingTable.Row>
                <ListingTable.Cell>Name</ListingTable.Cell>
                <ListingTable.Cell>Email</ListingTable.Cell>
                <ListingTable.Cell>Title</ListingTable.Cell>
              </ListingTable.Row>
            </ListingTable.Head>
            <ListingTable.Body>
              {rows.length === 0 ? (
                <ListingTable.Row>
                  <ListingTable.Cell colSpan={3}>
                    <ListingTable.EmptyState
                      title="No team members yet"
                      description="Add a person to the directory so they can be allocated."
                    />
                  </ListingTable.Cell>
                </ListingTable.Row>
              ) : (
                rows.map((member) => (
                  <ListingTable.Row key={member.id}>
                    <ListingTable.Cell>{member.name}</ListingTable.Cell>
                    <ListingTable.Cell>{member.email}</ListingTable.Cell>
                    <ListingTable.Cell>{member.title}</ListingTable.Cell>
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
