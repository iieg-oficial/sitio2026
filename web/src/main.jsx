import { createBrowserRouter, RouterProvider } from 'react-router';
import { createRoot } from 'react-dom/client'
import ReactGA from 'react-ga4';
import TagManager from 'react-gtm-module';
import './index.css'
import MainProvider from '@providers/MainProvider';
import Home from '@pages/Home';
import DynamicPage from './components/pageComponents/DynamicPage';
import Post from '@pages/Post';
import BusquedaGlobal from '@pages/BusquedaGlobal';
import PaginaIndividual from './components/pageComponents/PaginaIndividual'
import ClasificadorCultivos from '@pages/ClasificadorCultivos'

const env = import.meta.env;
const MODE = env.VITE_NODE_ENV
const isDev = MODE === 'development';
const trackingID = env.VITE_GOOGLE_ANALYTICS_ID;
const gtmId = env.VITE_GOOGLE_TAG_MANAGER_ID;

isDev && console.info('¡Tú estás viendo esto, porque estás en modo de desarrollo!');

if (trackingID && trackingID.startsWith('G-')) {
    ReactGA.initialize(trackingID, {
        testMode: MODE,
        gaOptions: {
            cookieFlags: isDev ? 'SameSite=None;Secure' : 'Lax'
        }
    });
} else if (isDev) {
    console.info('Google Analytics no inicializado: VITE_GOOGLE_ANALYTICS_ID no definido o inválido');
}

if (gtmId && gtmId.startsWith('GTM-')) {
    TagManager.initialize({ gtmId });
} else if (isDev) {
    console.info('Google Tag Manager no inicializado: VITE_GOOGLE_TAG_MANAGER_ID no definido o inválido');
}


const router = createBrowserRouter([
    {
        element: <MainProvider />,
        children: [
            { index: true, element: <Home /> },
            { path: '/comunidad', element: <Post /> },
            { path: '/resultados', element: <BusquedaGlobal /> },
            { path: '/busqueda', element: <BusquedaGlobal /> },
            { path: '/:slug', element: <DynamicPage /> },
            { path: '/comunidad/:slug', element: <PaginaIndividual /> },
            { path: '/capacitaciones/:slug', element: <PaginaIndividual /> },
            { path: '/convocatoria/:slug', element: <PaginaIndividual /> },
            { path: '/convocatorias/:slug', element: <PaginaIndividual /> },
            { path: '/mapas-historicos/:slug', element: <PaginaIndividual /> },
            { path: '/clasificador-de-cultivos', element: <ClasificadorCultivos /> }
        ],
    },
]);

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
