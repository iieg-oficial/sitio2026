import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createRoot } from 'react-dom/client'
import ReactGA from 'react-ga4';
import { Result } from 'antd';
import './index.css'
import { AuthProvider } from '@contexts/AuthContext';
import MainProvider from '@providers/MainProvider';
import ProtectedRoute from '@components/ProtectedRoute';
import RoleProtectedRoute from '@components/RoleProtectedRoute';
import ErrorBoundary from '@components/ErrorBoundary';
import MainLayout from '@components/MainLayout';
import { Navigate } from 'react-router';
import Login from '@pages/Login';
import Users from '@pages/Users';
import MenuManager from '@pages/MenuManager';
import PageEditor from '@pages/PageEditor';
import Media from '@pages/Media';
import ChangePassword from '@pages/ChangePassword';
import RevisionQueue from '@pages/RevisionQueue';
import Posts from '@pages/Posts';
import Subject from '@pages/Subject';
import Paginas from '@pages/Paginas';
import Plataformas from '@pages/Plataformas';
import DatosNuevos from '@pages/DatosNuevos';
import Flashes from '@pages/Flashes';
import Mapas from '@pages/Mapas';
import Valores from '@pages/Valores';
import PlanTrabajo from '@pages/PlanTrabajo';
import PlanInstitucional from '@pages/PlanInstitucional';
import Normatividad from '@pages/Normatividad';
import Directorio from '@pages/Directorio';
import Organos from '@pages/Organos';
import Archivos from '@pages/Archivos';
import Snieg from '@pages/Snieg';
import Preguntas from '@pages/Preguntas';

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
                    {
                        path: 'users',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani']}>
                                <Users />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'revision',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani']}>
                                <RevisionQueue />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'menu',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <MenuManager />
                            </RoleProtectedRoute>
                        )
                    },

                    {
                        path: 'pages/edit/:id',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <PageEditor />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'media',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Media />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'posts',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Posts />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'subjects',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Subject />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'paginas',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Paginas />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'plataformas',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Plataformas />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'datos-nuevos',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <DatosNuevos />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'flashes',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Flashes />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'mapas',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Mapas />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'valores',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Valores />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'normatividad',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Normatividad />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'plan-trabajo',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <PlanTrabajo />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'plan-institucional',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <PlanInstitucional />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'directorio',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Directorio />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'organos',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Organos />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'archivos',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Archivos />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'snieg',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Snieg />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'preguntas',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Preguntas />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'sistemas',
                        element: (
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Sistemas />
                            </RoleProtectedRoute>
                        )
                    },
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
