import { useEffect, useRef, type JSX } from "react";
import { useNavigate } from "react-router";
import { Box, CircularProgress } from "@wso2/oxygen-ui";
import { handleCallback } from "../auth";
import { resolveRoles, landingPath } from "../roles";

/** OIDC redirect target — <origin>/callback, per thunder-authentication. */
export default function CallbackPage(): JSX.Element {
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    handleCallback()
      .then((user) => {
        const groups = Array.isArray(user.profile?.groups) ? (user.profile.groups as string[]) : [];
        navigate(landingPath(resolveRoles(groups)), { replace: true });
      })
      .catch(() => navigate("/", { replace: true }));
  }, [navigate]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}
