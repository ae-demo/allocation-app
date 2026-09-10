import type { JSX } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../AuthContext";
import { landingPath } from "../roles";

/** "/" resolves to the signed-in user's role-appropriate home screen. */
export default function Landing(): JSX.Element {
  const { roles } = useAuth();
  const { search } = useLocation();
  return <Navigate to={{ pathname: landingPath(roles), search }} replace />;
}
