import type { JSX } from "react";
import { Link, Outlet, useLocation } from "react-router";
import {
  AppShell,
  ColorSchemeToggle,
  Divider,
  Footer,
  Header,
  Sidebar,
  UserMenu,
} from "@wso2/oxygen-ui";
import {
  Building2,
  ClipboardList,
  LogOut,
  Users,
  UserSquare2,
  BarChart3,
} from "@wso2/oxygen-ui-icons-react";
import { useAuth } from "../AuthContext";
import { canReach, type ScreenKey } from "../roles";

interface NavItem {
  id: string;
  label: string;
  path: string;
  screen: ScreenKey;
  icon: JSX.Element;
}

const NAV_ITEMS: NavItem[] = [
  { id: "customers", label: "Customers", path: "/customers", screen: "Customers", icon: <Building2 /> },
  {
    id: "allocation-requests",
    label: "Allocation Requests",
    path: "/allocation-requests",
    screen: "AllocationRequests",
    icon: <ClipboardList />,
  },
  {
    id: "allocations",
    label: "Allocations",
    path: "/allocations",
    screen: "AllocationsOverview",
    icon: <BarChart3 />,
  },
  { id: "team-members", label: "Team Members", path: "/team-members", screen: "TeamMembers", icon: <Users /> },
  {
    id: "utilization",
    label: "Utilization",
    path: "/utilization",
    screen: "UtilizationReport",
    icon: <BarChart3 />,
  },
  {
    id: "my-allocations",
    label: "My Allocations",
    path: "/my-allocations",
    screen: "MyAllocations",
    icon: <UserSquare2 />,
  },
];

export default function AppLayout(): JSX.Element {
  const { pathname, search } = useLocation();
  const { user, roles, signOut } = useAuth();

  const items = NAV_ITEMS.filter((item) => canReach(roles, item.screen));
  const active = items.find((item) => pathname.startsWith(item.path))?.id;
  const name = user.profile.name ?? user.profile.email ?? "Signed in";
  const email = user.profile.email ?? "";

  return (
    <AppShell>
      <AppShell.Navbar>
        <Header>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>AllocationApp</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <UserMenu>
              <UserMenu.Trigger name={name} />
              <UserMenu.Header name={name} email={email} role={roles.join(", ")} />
              <UserMenu.Item icon={<LogOut />} label="Sign out" onClick={() => void signOut()} />
            </UserMenu>
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      <AppShell.Sidebar>
        <Sidebar activeItem={active}>
          <Sidebar.Nav>
            <Sidebar.Category>
              {items.map((item) => (
                <Sidebar.Item key={item.id} id={item.id} link={<Link to={{ pathname: item.path, search }} />}>
                  <Sidebar.ItemIcon>{item.icon}</Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>{item.label}</Sidebar.ItemLabel>
                </Sidebar.Item>
              ))}
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </AppShell.Sidebar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </AppShell.Footer>
    </AppShell>
  );
}
