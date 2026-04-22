import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createRoot } from 'react-dom/client'
import ReactGA from 'react-ga4';
import { Result } from 'antd';
import './index.css'
import { AuthProvider } from '@contexts/AuthContext';
import MainProvider from '@providers/MainProvider';
import ProtectedRoute from '@components/ProtectedRoute';
import ErrorBoundary from '@components/ErrorBoundary';
import MainLayout from '@components/MainLayout';
import { Navigate } from 'react-router';
import Login from '@pages/Login';
import ChangePassword from '@pages/ChangePassword';
import { adminRoutes } from '@router/adminRoutes';
import { editorRoutes } from '@router/editorRoutes';

const { DEV, VITE_GOOGLE_ANALYTICS_ID } = import.meta.env;

if (VITE_GOOGLE_ANALYTICS_ID && VITE_GOOGLE_ANALYTICS_ID.startsWith('G-')) {
    ReactGA.initialize(VITE_GOOGLE_ANALYTICS_ID, {
        testMode: DEV,
        gaOptions: {
            cookieFlags: DEV ? 'SameSite=None;Secure' : 'Lax'
        }
    });
} else if (DEV) {
    console.info('Google Analytics no inicializado: VITE_GOOGLE_ANALYTICS_ID no definido o inválido');
}

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
        errorElement: <ErrorBoundary />
    }, {
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
                    {
                        path: 'change-password',
                        element: (
                            <ProtectedRoute>
                                <ChangePassword />
                            </ProtectedRoute>
                        )
                    }, {
                        path: '*',
                        element: (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                                <Result
                                    status="404"
                                    title="404"
                                    subTitle="Lo sentimos, la página que visitaste no existe."
                                />
                            </div>
                        )
                    },
                ]
            }
        ],
    },
], { basename: '/administrador' });

createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
);
