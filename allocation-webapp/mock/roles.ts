// specs/design/security.json -> roles[].name, in that file's order. The first
// entry is who a visitor is with no `?role=` on the URL — security.json's
// coldStartRole ("Team Member") is listed first for exactly that reason.
export const mockRoles = ["Team Member", "Account Manager", "Resource Manager", "Allocation Admin"];
