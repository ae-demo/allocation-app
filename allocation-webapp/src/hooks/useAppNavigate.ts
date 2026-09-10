import { useCallback } from "react";
import { useLocation, useNavigate as useRouterNavigate, type NavigateOptions } from "react-router";

/**
 * Drop-in replacement for react-router's `useNavigate` that carries the
 * current URL's query string forward on every in-app navigation.
 *
 * Mock mode (mock/auth.ts) resolves the signed-in role by reading
 * `?role=`/`?auth=` live off `window.location.search` on every call —
 * there is no session storage, the URL IS the session. Client-side
 * navigation that builds a bare path (`navigate("/customers/new")`) drops
 * that query string, so the very next API call silently falls back to the
 * mock's default role and every mutation after the first click gets a
 * role-mismatched 403. Real Thunder auth resolves roles from the JWT, not
 * the URL, so preserving an ordinary app query string here is a no-op
 * outside mock mode.
 */
export function useAppNavigate() {
  const navigate = useRouterNavigate();
  const { search } = useLocation();

  return useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        navigate(to);
        return;
      }
      if (!search || to.includes("?")) {
        navigate(to, options);
        return;
      }
      const hashIndex = to.indexOf("#");
      const path = hashIndex === -1 ? to : to.slice(0, hashIndex);
      const hash = hashIndex === -1 ? "" : to.slice(hashIndex);
      navigate(`${path}${search}${hash}`, options);
    },
    [navigate, search],
  );
}
