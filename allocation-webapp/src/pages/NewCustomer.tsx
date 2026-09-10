import { useState, type FormEvent, type JSX } from "react";
import { useAppNavigate as useNavigate } from "../hooks/useAppNavigate";
import {
  Alert,
  AppBreadcrumbs,
  Box,
  Button,
  PageContent,
  PageTitle,
  Stack,
  TextField,
} from "@wso2/oxygen-ui";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";

export default function NewCustomer(): JSX.Element {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { data, error: apiError } = await api.createCustomer({
      name,
      contactName,
      contactEmail,
      contactPhone: contactPhone || undefined,
    });
    setSaving(false);
    if (apiError) {
      setError(errorMessage(apiError, "Could not create the customer."));
      return;
    }
    navigate(`/customers/${data.id}`);
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.BackButton onClick={() => navigate("/customers")}>Back</PageTitle.BackButton>
        <AppBreadcrumbs
          items={[
            { key: "customers", label: "Customers", onClick: () => navigate("/customers") },
            { key: "new", label: "New customer" },
          ]}
        />
        <PageTitle.Header>New Customer</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 480 }}>
        <Stack spacing={3}>
          <TextField label="Customer name" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField
            label="Contact name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
          <TextField
            label="Contact email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
          <TextField
            label="Contact phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate("/customers")}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              Create customer
            </Button>
          </Stack>
        </Stack>
      </Box>
    </PageContent>
  );
}
