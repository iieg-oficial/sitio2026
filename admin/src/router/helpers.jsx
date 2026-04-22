import RoleProtectedRoute from "../components/RoleProtectedRoute";

export const protectedRoute = (path, element, allowedRoles) => ({
  path,
  element: (
    <RoleProtectedRoute allowedRoles={allowedRoles}>
      {element}
    </RoleProtectedRoute>
  ),
});