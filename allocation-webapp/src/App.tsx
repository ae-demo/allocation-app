import type { JSX } from "react";
import { Route, Routes } from "react-router";
import { AuthGate } from "./AuthContext";
import RoleGuard from "./components/RoleGuard";
import AppLayout from "./layouts/AppLayout";
import CallbackPage from "./pages/CallbackPage";
import Landing from "./pages/Landing";
import Customers from "./pages/Customers";
import NewCustomer from "./pages/NewCustomer";
import CustomerDetail from "./pages/CustomerDetail";
import NewEngagement from "./pages/NewEngagement";
import EngagementDetail from "./pages/EngagementDetail";
import NewAllocationRequest from "./pages/NewAllocationRequest";
import AllocationRequests from "./pages/AllocationRequests";
import AssignTeamMember from "./pages/AssignTeamMember";
import RejectRequest from "./pages/RejectRequest";
import AllocationsOverview from "./pages/AllocationsOverview";
import AllocationDetail from "./pages/AllocationDetail";
import TeamMembers from "./pages/TeamMembers";
import NewTeamMember from "./pages/NewTeamMember";
import UtilizationReport from "./pages/UtilizationReport";
import MyAllocations from "./pages/MyAllocations";

export default function App(): JSX.Element {
  return (
    <Routes>
      {/* Platform-hosted Thunder sign-in redirects back here; no chrome. */}
      <Route path="/callback" element={<CallbackPage />} />

      <Route
        element={
          <AuthGate>
            <AppLayout />
          </AuthGate>
        }
      >
        <Route path="/" element={<Landing />} />

        <Route
          path="/customers"
          element={
            <RoleGuard screen="Customers">
              <Customers />
            </RoleGuard>
          }
        />
        <Route
          path="/customers/new"
          element={
            <RoleGuard screen="Customers">
              <NewCustomer />
            </RoleGuard>
          }
        />
        <Route
          path="/customers/:customerId"
          element={
            <RoleGuard screen="Customers">
              <CustomerDetail />
            </RoleGuard>
          }
        />
        <Route
          path="/customers/:customerId/engagements/new"
          element={
            <RoleGuard screen="Customers">
              <NewEngagement />
            </RoleGuard>
          }
        />
        <Route
          path="/engagements/:engagementId"
          element={
            <RoleGuard screen="Customers">
              <EngagementDetail />
            </RoleGuard>
          }
        />
        <Route
          path="/engagements/:engagementId/allocation-requests/new"
          element={
            <RoleGuard screen="Customers">
              <NewAllocationRequest />
            </RoleGuard>
          }
        />

        <Route
          path="/allocation-requests"
          element={
            <RoleGuard screen="AllocationRequests">
              <AllocationRequests />
            </RoleGuard>
          }
        />
        <Route
          path="/allocation-requests/:requestId/assign"
          element={
            <RoleGuard screen="AllocationRequests">
              <AssignTeamMember />
            </RoleGuard>
          }
        />
        <Route
          path="/allocation-requests/:requestId/reject"
          element={
            <RoleGuard screen="AllocationRequests">
              <RejectRequest />
            </RoleGuard>
          }
        />

        <Route
          path="/allocations"
          element={
            <RoleGuard screen="AllocationsOverview">
              <AllocationsOverview />
            </RoleGuard>
          }
        />
        <Route
          path="/allocations/:allocationId"
          element={
            <RoleGuard screen="AllocationsOverview">
              <AllocationDetail />
            </RoleGuard>
          }
        />

        <Route
          path="/team-members"
          element={
            <RoleGuard screen="TeamMembers">
              <TeamMembers />
            </RoleGuard>
          }
        />
        <Route
          path="/team-members/new"
          element={
            <RoleGuard screen="TeamMembers">
              <NewTeamMember />
            </RoleGuard>
          }
        />
        <Route
          path="/utilization"
          element={
            <RoleGuard screen="UtilizationReport">
              <UtilizationReport />
            </RoleGuard>
          }
        />

        <Route
          path="/my-allocations"
          element={
            <RoleGuard screen="MyAllocations">
              <MyAllocations />
            </RoleGuard>
          }
        />
      </Route>
    </Routes>
  );
}
