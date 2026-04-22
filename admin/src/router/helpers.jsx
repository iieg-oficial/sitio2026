import RoleProtectedRoute from "../components/RoleProtectedRoute";

export const protectedRoute = (element, allowedRoles) => ({
  element: (
    <RoleProtectedRoute allowedRoles={allowedRoles}>
      {element}
    </RoleProtectedRoute>
  ),
});