import { useEffect, useState, type FormEvent, type JSX } from "react";
import { useParams } from "react-router";
import { useAppNavigate as useNavigate } from "../hooks/useAppNavigate";
import {
  Alert,
  AppBreadcrumbs,
  Box,
  Button,
  CircularProgress,
  PageContent,
  PageTitle,
  Stack,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { AllocationRequest, Engagement } from "../types";

export default function RejectRequest(): JSX.Element {
  const { requestId = "" } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<AllocationRequest | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .listAllocationRequests({ limit: 100 })
      .then(({ data, error: apiError }) => {
        if (cancelled) return;
        if (apiError) throw apiError;
        const found = data.data.find((r) => r.id === requestId);
        if (!found) throw { message: "This allocation request could not be found." };
        setRequest(found);
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
    const { error: apiError } = await api.rejectAllocationRequest(requestId, reason);
    setSaving(false);
    if (apiError) {
      setError(errorMessage(apiError, "Could not reject this request."));
      return;
    }
    navigate("/allocation-requests");
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
        <PageTitle.BackButton onClick={() => navigate(`/allocation-requests/${requestId}/assign`)}>
          Back
        </PageTitle.BackButton>
        <AppBreadcrumbs
          items={[
            { key: "requests", label: "Allocation Requests", onClick: () => navigate("/allocation-requests") },
            {
              key: "request",
              label: `${engagement?.name ?? request.engagementId} — ${request.role}`,
              onClick: () => navigate(`/allocation-requests/${requestId}/assign`),
            },
            { key: "reject", label: "Reject" },
          ]}
        />
        <PageTitle.Header>Reject Request</PageTitle.Header>
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

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 560 }}>
        <Stack spacing={3}>
          <TextField
            label="Reason for rejection"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={3}
            required
          />
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate(`/allocation-requests/${requestId}/assign`)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="error" disabled={saving}>
              Reject request
            </Button>
          </Stack>
        </Stack>
      </Box>
    </PageContent>
  );
}
