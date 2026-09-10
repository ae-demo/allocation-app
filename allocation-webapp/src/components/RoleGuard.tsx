import type { JSX, ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../AuthContext";
import { canReach, landingPath, type ScreenKey } from "../roles";

/** Enforces security.json's screen->role mapping (REQ-013b) at the route level. */
export default function RoleGuard({ screen, children }: { screen: ScreenKey; children: ReactNode }): JSX.Element {
  const { roles } = useAuth();
  const { search } = useLocation();
  if (!canReach(roles, screen)) {
    return <Navigate to={{ pathname: landingPath(roles), search }} replace />;
  }
  return <>{children}</>;
}
