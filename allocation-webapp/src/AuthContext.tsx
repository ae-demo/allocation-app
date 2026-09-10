// Gates every signed-in screen on a real Thunder session (REQ-013a): an
// unauthenticated visitor is sent to sign-in before anything under AppLayout
// renders, and the resolved roles (security.json) drive nav + route guards.

import { createContext, useContext, useEffect, useState, type JSX, type ReactNode } from "react";
import type { User } from "oidc-client-ts";
import { Box, CircularProgress } from "@wso2/oxygen-ui";
import { currentUser, signIn, signOut as authSignOut } from "./auth";
import { resolveRoles, type Role } from "./roles";

interface AuthState {
  user: User;
  roles: Role[];
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthGate({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<AuthState | "loading" | "anonymous">("loading");

  useEffect(() => {
    let cancelled = false;
    currentUser().then((user) => {
      if (cancelled) return;
      if (!user) {
        setState("anonymous");
        void signIn();
        return;
      }
      const groups = Array.isArray(user.profile?.groups) ? (user.profile.groups as string[]) : [];
      setState({ user, roles: resolveRoles(groups), signOut: authSignOut });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading" || state === "anonymous") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() called outside AuthGate");
  return ctx;
}
