import { createBrowserRouter, Navigate } from 'react-router-dom';
import { adminRoutes } from './adminRoutes';
import { editorRoutes } from './editorRoutes';
import { Login } from '../pages/Login';
import { MainLayout } from '../layouts/MainLayout';
import { MainProvider } from '../providers/MainProvider';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    element: (
      <ProtectedRoute>
        <MainProvider />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <MainLayout />,
        errorElement: <ErrorBoundary />,
        children: [
          { index: true, element: <Navigate to="menu" replace /> },
          ...adminRoutes,
          ...editorRoutes,
        ],
      },
    ],
  },
]);