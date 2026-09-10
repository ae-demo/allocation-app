import { useEffect, useState, type JSX } from "react";
import { useParams } from "react-router";
import { useAppNavigate as useNavigate } from "../hooks/useAppNavigate";
import {
  Alert,
  AppBreadcrumbs,
  Box,
  Button,
  CircularProgress,
  ListingTable,
  PageContent,
  PageTitle,
  Typography,
} from "@wso2/oxygen-ui";
import { Plus } from "@wso2/oxygen-ui-icons-react";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { Customer, Engagement } from "../types";

function formatDateRange(startDate: string, endDate: string): string {
  return `${startDate} – ${endDate}`;
}

export default function CustomerDetail(): JSX.Element {
  const { customerId = "" } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [engagements, setEngagements] = useState<Engagement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getCustomer(customerId), api.listEngagements({ customerId, limit: 100 })])
      .then(([customerRes, engagementsRes]) => {
        if (cancelled) return;
        if (customerRes.error) throw customerRes.error;
        if (engagementsRes.error) throw engagementsRes.error;
        setCustomer(customerRes.data);
        setEngagements(engagementsRes.data.data);
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Could not load this customer.")));
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  if (error) {
    return (
      <PageContent>
        <Alert severity="error">{error}</Alert>
      </PageContent>
    );
  }

  if (!customer) {
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
        <PageTitle.BackButton onClick={() => navigate("/customers")}>Back</PageTitle.BackButton>
        <AppBreadcrumbs
          items={[
            { key: "customers", label: "Customers", onClick: () => navigate("/customers") },
            { key: "customer", label: customer.name },
          ]}
        />
        <PageTitle.Header>{customer.name}</PageTitle.Header>
        <PageTitle.Actions>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => navigate(`/customers/${customerId}/engagements/new`)}
          >
            New Engagement
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Contact: {customer.contactName} — {customer.contactEmail}
        {customer.contactPhone ? ` · ${customer.contactPhone}` : ""}
      </Typography>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Engagement</ListingTable.Cell>
              <ListingTable.Cell>Dates</ListingTable.Cell>
              <ListingTable.Cell>Status</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {!engagements || engagements.length === 0 ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={3}>
                  <ListingTable.EmptyState
                    title="No engagements yet"
                    description="Create an engagement to start planning staffing."
                  />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : (
              engagements.map((engagement) => (
                <ListingTable.Row
                  key={engagement.id}
                  clickable
                  onClick={() => navigate(`/engagements/${engagement.id}`)}
                >
                  <ListingTable.Cell>{engagement.name}</ListingTable.Cell>
                  <ListingTable.Cell>{formatDateRange(engagement.startDate, engagement.endDate)}</ListingTable.Cell>
                  <ListingTable.Cell>{engagement.status}</ListingTable.Cell>
                </ListingTable.Row>
              ))
            )}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>
    </PageContent>
  );
}
