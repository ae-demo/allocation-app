import { useEffect, useState, type JSX } from "react";
import { Alert, Box, Card, CircularProgress, ListingTable, PageContent, PageTitle } from "@wso2/oxygen-ui";
import { BarChart } from "@wso2/oxygen-ui-charts-react";
import { api } from "../api";
import { errorMessage } from "../lib/apiError";
import type { TeamMemberUtilization } from "../types";

export default function UtilizationReport(): JSX.Element {
  const [rows, setRows] = useState<TeamMemberUtilization[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getUtilizationReport()
      .then(({ data, error: apiError }) => {
        if (cancelled) return;
        if (apiError) throw apiError;
        setRows(data.data);
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Could not load the utilization report.")));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Utilization Report</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!rows ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card sx={{ p: 2, mb: 3 }}>
            <BarChart
              data={rows.map((r) => ({ name: r.name, utilization: r.totalUtilizationPct }))}
              xAxisDataKey="name"
              bars={[{ dataKey: "utilization", name: "Utilization %", fill: "#ff7300" }]}
              height={260}
            />
          </Card>

          <ListingTable.Container>
            <ListingTable>
              <ListingTable.Head>
                <ListingTable.Row>
                  <ListingTable.Cell>Team Member</ListingTable.Cell>
                  <ListingTable.Cell>Total Utilization</ListingTable.Cell>
                </ListingTable.Row>
              </ListingTable.Head>
              <ListingTable.Body>
                {rows.length === 0 ? (
                  <ListingTable.Row>
                    <ListingTable.Cell colSpan={2}>
                      <ListingTable.EmptyState title="No utilization data yet" />
                    </ListingTable.Cell>
                  </ListingTable.Row>
                ) : (
                  rows.map((row) => (
                    <ListingTable.Row key={row.teamMemberId}>
                      <ListingTable.Cell>{row.name}</ListingTable.Cell>
                      <ListingTable.Cell>{row.totalUtilizationPct}%</ListingTable.Cell>
                    </ListingTable.Row>
                  ))
                )}
              </ListingTable.Body>
            </ListingTable>
          </ListingTable.Container>
        </>
      )}
    </PageContent>
  );
}
