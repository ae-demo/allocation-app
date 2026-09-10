import { useState, type FormEvent, type JSX } from "react";
import { useParams } from "react-router";
import { useAppNavigate as useNavigate } from "../hooks/useAppNavigate";
import {
  Alert,
  AppBreadcrumbs,
  Box,
  Button,
  IconButton,
  ListingTable,
  PageContent,
  PageTitle,
  Stack,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { Plus, Trash2 } from "@wso2/oxygen-ui-icons-react";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { StaffingPlanLine } from "../types";

export default function NewEngagement(): JSX.Element {
  const { customerId = "" } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [staffingPlan, setStaffingPlan] = useState<StaffingPlanLine[]>([{ role: "", targetHeadcount: 1 }]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateLine(index: number, patch: Partial<StaffingPlanLine>) {
    setStaffingPlan((lines) => lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function removeLine(index: number) {
    setStaffingPlan((lines) => lines.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const plan = staffingPlan.filter((line) => line.role.trim().length > 0);
    const { data, error: apiError } = await api.createEngagement({
      customerId,
      name,
      description: description || undefined,
      startDate,
      endDate,
      staffingPlan: plan,
    });
    setSaving(false);
    if (apiError) {
      setError(errorMessage(apiError, "Could not create the engagement."));
      return;
    }
    navigate(`/engagements/${data.id}`);
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.BackButton onClick={() => navigate(`/customers/${customerId}`)}>Back</PageTitle.BackButton>
        <AppBreadcrumbs
          items={[
            { key: "customers", label: "Customers", onClick: () => navigate("/customers") },
            { key: "customer", label: "Customer", onClick: () => navigate(`/customers/${customerId}`) },
            { key: "new", label: "New engagement" },
          ]}
        />
        <PageTitle.Header>New Engagement</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 720 }}>
        <Stack spacing={3}>
          <TextField label="Engagement name" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField
            label="Description — scope and purpose"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Start date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              required
              fullWidth
            />
            <TextField
              label="End date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              required
              fullWidth
            />
          </Stack>

          <Typography variant="h6">Staffing plan</Typography>
          <ListingTable.Container>
            <ListingTable>
              <ListingTable.Head>
                <ListingTable.Row>
                  <ListingTable.Cell>Role</ListingTable.Cell>
                  <ListingTable.Cell>Target headcount</ListingTable.Cell>
                  <ListingTable.Cell align="right">Remove</ListingTable.Cell>
                </ListingTable.Row>
              </ListingTable.Head>
              <ListingTable.Body>
                {staffingPlan.map((line, index) => (
                  <ListingTable.Row key={index}>
                    <ListingTable.Cell>
                      <TextField
                        size="small"
                        placeholder="e.g. Developer"
                        value={line.role}
                        onChange={(e) => updateLine(index, { role: e.target.value })}
                      />
                    </ListingTable.Cell>
                    <ListingTable.Cell>
                      <TextField
                        size="small"
                        type="number"
                        slotProps={{ htmlInput: { min: 1 } }}
                        value={line.targetHeadcount}
                        onChange={(e) => updateLine(index, { targetHeadcount: Number(e.target.value) })}
                      />
                    </ListingTable.Cell>
                    <ListingTable.Cell align="right">
                      <IconButton size="small" onClick={() => removeLine(index)} aria-label="Remove role">
                        <Trash2 size={16} />
                      </IconButton>
                    </ListingTable.Cell>
                  </ListingTable.Row>
                ))}
              </ListingTable.Body>
            </ListingTable>
          </ListingTable.Container>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Plus size={16} />}
              onClick={() => setStaffingPlan((lines) => [...lines, { role: "", targetHeadcount: 1 }])}
            >
              Add role
            </Button>
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate(`/customers/${customerId}`)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              Create engagement
            </Button>
          </Stack>
        </Stack>
      </Box>
    </PageContent>
  );
}
