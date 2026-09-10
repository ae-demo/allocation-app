import { useEffect, useState, type FormEvent, type JSX } from "react";
import { useParams } from "react-router";
import { useAppNavigate as useNavigate } from "../hooks/useAppNavigate";
import {
  Alert,
  AppBreadcrumbs,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  PageContent,
  PageTitle,
  Stack,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { AllocationRequest, Engagement, TeamMember } from "../types";

export default function AssignTeamMember(): JSX.Element {
  const { requestId = "" } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<AllocationRequest | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamMemberId, setTeamMemberId] = useState("");
  const [role, setRole] = useState("");
  const [utilizationPct, setUtilizationPct] = useState(100);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listAllocationRequests({ limit: 100 }), api.listTeamMembers({ limit: 100 })])
      .then(([requestsRes, teamMembersRes]) => {
        if (cancelled) return;
        if (requestsRes.error) throw requestsRes.error;
        if (teamMembersRes.error) throw teamMembersRes.error;
        const found = requestsRes.data.data.find((r) => r.id === requestId);
        if (!found) throw { message: "This allocation request could not be found." };
        setRequest(found);
        setRole(found.role);
        setUtilizationPct(found.utilizationPct);
        setStartDate(found.startDate);
        setEndDate(found.endDate);
        setTeamMembers(teamMembersRes.data.data);
        return api.getEngagement(found.engagementId);
      })
      .then((engagementRes) => {
        if (cancelled || !engagementRes) return;
        if (!engagementRes.error) setEngagement(engagementRes.data);
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Could not load this request.")));
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: apiError } = await api.approveAllocationRequest(requestId, {
      teamMemberId,
      role,
      utilizationPct,
      startDate,
      endDate,
    });
    setSaving(false);
    if (apiError) {
      setError(errorMessage(apiError, "Could not approve and assign this request."));
      return;
    }
    navigate("/allocations");
  }

  if (error && !request) {
    return (
      <PageContent>
        <Alert severity="error">{error}</Alert>
      </PageContent>
    );
  }

  if (!request) {
    return (
      <PageContent>
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.BackButton onClick={() => navigate("/allocation-requests")}>Back</PageTitle.BackButton>
        <AppBreadcrumbs
          items={[
            { key: "requests", label: "Allocation Requests", onClick: () => navigate("/allocation-requests") },
            { key: "request", label: `${engagement?.name ?? request.engagementId} — ${request.role}` },
          ]}
        />
        <PageTitle.Header>Assign Team Member</PageTitle.Header>
      </PageTitle>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {engagement?.name ?? request.engagementId} · {request.role} · {request.utilizationPct}% ·{" "}
        {request.startDate} – {request.endDate}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 640 }}>
        <Stack spacing={3}>
          <TextField
            select
            label="Team member"
            value={teamMemberId}
            onChange={(e) => setTeamMemberId(e.target.value)}
            helperText="Available team members"
            required
          >
            {teamMembers.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.name} {member.title ? `— ${member.title}` : ""}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField label="Role" value={role} onChange={(e) => setRole(e.target.value)} fullWidth required />
            <TextField
              label="Utilization % — e.g. 100"
              type="number"
              slotProps={{ htmlInput: { min: 1, max: 100 } }}
              value={utilizationPct}
              onChange={(e) => setUtilizationPct(Number(e.target.value))}
              fullWidth
              required
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Start date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
            <TextField
              label="End date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
          </Stack>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" color="error" onClick={() => navigate(`/allocation-requests/${requestId}/reject`)}>
              Reject
            </Button>
            <Button type="submit" variant="contained" disabled={saving || !teamMemberId}>
              Approve &amp; Assign
            </Button>
          </Stack>
        </Stack>
      </Box>
    </PageContent>
  );
}
