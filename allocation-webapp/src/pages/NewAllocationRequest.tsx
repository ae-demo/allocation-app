import { useEffect, useState, type FormEvent, type JSX } from "react";
import { useParams } from "react-router";
import { useAppNavigate as useNavigate } from "../hooks/useAppNavigate";
import {
  Alert,
  AppBreadcrumbs,
  Box,
  Button,
  MenuItem,
  PageContent,
  PageTitle,
  Stack,
  TextField,
} from "@wso2/oxygen-ui";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { Engagement } from "../types";

export default function NewAllocationRequest(): JSX.Element {
  const { engagementId = "" } = useParams();
  const navigate = useNavigate();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [role, setRole] = useState("");
  const [utilizationPct, setUtilizationPct] = useState(100);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getEngagement(engagementId)
      .then(({ data, error: apiError }) => {
        if (apiError) {
          setError(errorMessage(apiError, "Could not load this engagement."));
          return;
        }
        setEngagement(data);
        setRole(data.staffingPlan?.[0]?.role ?? "");
      });
  }, [engagementId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: apiError } = await api.createAllocationRequest({
      engagementId,
      role,
      utilizationPct,
      startDate,
      endDate,
    });
    setSaving(false);
    if (apiError) {
      setError(errorMessage(apiError, "Could not submit the allocation request."));
      return;
    }
    navigate(`/engagements/${engagementId}`);
  }

  const roleOptions = engagement?.staffingPlan?.map((line) => line.role) ?? [];

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.BackButton onClick={() => navigate(`/engagements/${engagementId}`)}>Back</PageTitle.BackButton>
        <AppBreadcrumbs
          items={[
            { key: "customers", label: "Customers", onClick: () => navigate("/customers") },
            ...(engagement
              ? [{ key: "engagement", label: engagement.name, onClick: () => navigate(`/engagements/${engagementId}`) }]
              : []),
            { key: "new", label: "New request" },
          ]}
        />
        <PageTitle.Header>New Allocation Request</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 560 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2}>
            {roleOptions.length > 0 ? (
              <TextField
                select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                fullWidth
                required
              >
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
            <Button variant="outlined" onClick={() => navigate(`/engagements/${engagementId}`)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              Submit request
            </Button>
          </Stack>
        </Stack>
      </Box>
    </PageContent>
  );
}
