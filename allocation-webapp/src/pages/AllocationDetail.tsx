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
} from "@wso2/oxygen-ui";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { Allocation, Engagement, TeamMember } from "../types";

export default function AllocationDetail(): JSX.Element {
  const { allocationId = "" } = useParams();
  const navigate = useNavigate();
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [role, setRole] = useState("");
  const [utilizationPct, setUtilizationPct] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .listAllocations({ limit: 100 })
      .then(({ data, error: apiError }) => {
        if (cancelled) return;
        if (apiError) throw apiError;
        const found = data.data.find((a) => a.id === allocationId);
        if (!found) throw { message: "This allocation could not be found." };
        setAllocation(found);
        setRole(found.role);
        setUtilizationPct(found.utilizationPct);
        setStartDate(found.startDate);
        setEndDate(found.endDate);
        return Promise.all([api.listTeamMembers({ limit: 100 }), api.getEngagement(found.engagementId)]).then(
          ([teamMembersRes, engagementRes]) => {
            if (cancelled) return;
            if (!teamMembersRes.error) {
              setTeamMember(teamMembersRes.data.data.find((m) => m.id === found.teamMemberId) ?? null);
            }
            if (!engagementRes.error) setEngagement(engagementRes.data);
          },
        );
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Could not load this allocation.")));
    return () => {
      cancelled = true;
    };
  }, [allocationId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    const { data, error: apiError } = await api.updateAllocation(allocationId, {
      role,
      utilizationPct,
      startDate,
      endDate,
    });
    setSaving(false);
    if (apiError) {
      setError(errorMessage(apiError, "Could not save changes to this allocation."));
      return;
    }
    setAllocation(data);
    setNotice("Changes saved.");
  }

  async function handleEnd() {
    setEnding(true);
    setError(null);
    const { data, error: apiError } = await api.endAllocation(allocationId);
    setEnding(false);
    if (apiError) {
      setError(errorMessage(apiError, "Could not end this allocation."));
      return;
    }
    setAllocation(data);
    navigate("/allocations");
  }

  if (error && !allocation) {
    return (
      <PageContent>
        <Alert severity="error">{error}</Alert>
      </PageContent>
    );
  }

  if (!allocation) {
    return (
      <PageContent>
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      </PageContent>
    );
  }

  const heading = `${teamMember?.name ?? allocation.teamMemberId} — ${engagement?.name ?? allocation.engagementId}`;
  const roleOptions = engagement?.staffingPlan?.map((line) => line.role) ?? [];

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.BackButton onClick={() => navigate("/allocations")}>Back</PageTitle.BackButton>
        <AppBreadcrumbs
          items={[
            { key: "allocations", label: "Allocations", onClick: () => navigate("/allocations") },
            { key: "allocation", label: heading },
          ]}
        />
        <PageTitle.Header>{heading}</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {notice}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 640 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2}>
            {roleOptions.length > 0 ? (
              <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)} fullWidth required>
                {roleOptions.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField label="Role" value={role} onChange={(e) => setRole(e.target.value)} fullWidth required />
            )}
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
            <Button variant="outlined" color="error" disabled={ending || allocation.status === "Ended"} onClick={handleEnd}>
              End Allocation
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              Save changes
            </Button>
          </Stack>
        </Stack>
      </Box>
    </PageContent>
  );
}
