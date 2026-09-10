import { useState, type FormEvent, type JSX } from "react";
import { useAppNavigate as useNavigate } from "../hooks/useAppNavigate";
import { Alert, AppBreadcrumbs, Box, Button, PageContent, PageTitle, Stack, TextField } from "@wso2/oxygen-ui";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";

export default function NewTeamMember(): JSX.Element {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: apiError } = await api.createTeamMember({ name, email, title: title || undefined });
    setSaving(false);
    if (apiError) {
      setError(errorMessage(apiError, "Could not add this team member."));
      return;
    }
    navigate("/team-members");
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.BackButton onClick={() => navigate("/team-members")}>Back</PageTitle.BackButton>
        <AppBreadcrumbs
          items={[
            { key: "team-members", label: "Team Members", onClick: () => navigate("/team-members") },
            { key: "new", label: "New team member" },
          ]}
        />
        <PageTitle.Header>New Team Member</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 480 }}>
        <Stack spacing={3}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate("/team-members")}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              Add team member
            </Button>
          </Stack>
        </Stack>
      </Box>
    </PageContent>
  );
}
