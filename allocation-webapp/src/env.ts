// Typed read of window._env_, mounted by the platform at /env-config.js
// (or served by mock/plugin.ts under `--mode mock`). Never build-time config —
// see react-webapp's Constraints for why import.meta.env has no place here.

type Env = {
  // thunder (auth platform-resource) — dependency name "thunder" -> THUNDER_*
  THUNDER_CLIENT_ID: string;
  THUNDER_ISSUER: string;
  THUNDER_JWKS_URL: string;
  THUNDER_SCOPES: string;
};

declare global {
  interface Window {
    _env_: Env;
  }
}

if (!window._env_) {
  throw new Error(
    "window._env_ not set — /env-config.js failed to load. " +
      "The platform mounts this file; if you see this locally, host " +
      "/env-config.js from your dev server.",
  );
}

export const env: Env = window._env_;
