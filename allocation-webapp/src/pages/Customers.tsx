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
import type { Customer, Engagement } from "../types";

interface CustomerRow extends Customer {
  engagementCount: number;
  activeEngagementCount: number;
}

export default function Customers(): JSX.Element {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [engagements, setEngagements] = useState<Engagement[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listCustomers({ limit: 100 }), api.listEngagements({ limit: 100 })])
      .then(([customersRes, engagementsRes]) => {
        if (cancelled) return;
        if (customersRes.error) throw customersRes.error;
        if (engagementsRes.error) throw engagementsRes.error;
        setCustomers(customersRes.data.data);
        setEngagements(engagementsRes.data.data);
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Could not load customers.")));
    return () => {
      cancelled = true;
    };
  }, []);

  const rows: CustomerRow[] = useMemo(() => {
    if (!customers) return [];
    return customers
      .map((customer) => {
        const theirs = (engagements ?? []).filter((e) => e.customerId === customer.id);
        return {
          ...customer,
          engagementCount: theirs.length,
          activeEngagementCount: theirs.filter((e) => e.status === "Active").length,
        };
      })
      .filter(
        (c) =>
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.contactName.toLowerCase().includes(search.toLowerCase()),
      );
  }, [customers, engagements, search]);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Customers</PageTitle.Header>
        <PageTitle.Actions>
          <SearchBar
            placeholder="Search customers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate("/customers/new")}>
            New Customer
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!customers ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ListingTable.Container>
          <ListingTable>
            <ListingTable.Head>
              <ListingTable.Row>
                <ListingTable.Cell>Customer</ListingTable.Cell>
                <ListingTable.Cell>Contact</ListingTable.Cell>
                <ListingTable.Cell>Engagements</ListingTable.Cell>
                <ListingTable.Cell>Active</ListingTable.Cell>
              </ListingTable.Row>
            </ListingTable.Head>
            <ListingTable.Body>
              {rows.length === 0 ? (
                <ListingTable.Row>
                  <ListingTable.Cell colSpan={4}>
                    <ListingTable.EmptyState
                      title="No customers yet"
                      description="Create a customer to start planning engagements."
                    />
                  </ListingTable.Cell>
                </ListingTable.Row>
              ) : (
                rows.map((row) => (
                  <ListingTable.Row key={row.id} clickable onClick={() => navigate(`/customers/${row.id}`)}>
                    <ListingTable.Cell>{row.name}</ListingTable.Cell>
                    <ListingTable.Cell>{row.contactName}</ListingTable.Cell>
                    <ListingTable.Cell>{row.engagementCount}</ListingTable.Cell>
                    <ListingTable.Cell>{row.activeEngagementCount}</ListingTable.Cell>
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
