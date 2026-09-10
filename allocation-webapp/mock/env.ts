// mockEnv carries exactly the keys the platform emits for this component: the
// thunder auth dependency's four OIDC keys. No sibling API address belongs
// here — that is same-origin /api (react-webapp's Constraints).
export const mockEnv = {
  THUNDER_CLIENT_ID: "mock-client",
  THUNDER_ISSUER: "https://mock-idp.test",
  THUNDER_JWKS_URL: "https://mock-idp.test/.well-known/jwks.json",
  THUNDER_SCOPES: "openid profile email group ou",
};
