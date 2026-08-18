import { useContext, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';
import Footer from '@components/Footer';
import GlobalContext from '@contexts/GlobalContext';
import Navbardinamic from '@components/menu/Navbardinamic';
import { useScrollToHash } from "@hooks/useScrollToHash";


const MainLayout = () => {
    const { isMenuPreview } = useContext(GlobalContext);
    const location = useLocation();
    useScrollToHash();

    // Convierte el pathname actual en un nombre de clase CSS limpio (ej: /nosotros/mision -> page-nosotros-mision)
    const getSlugClass = (pathname) => {
        if (!pathname || pathname === '/') return 'page-home';
        const cleanPath = pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '-');
        return `page-${cleanPath}`;
    };

    const pageSlugClass = getSlugClass(location.pathname);

    return (
        <div className={`layout-wrapper ${pageSlugClass}`}>
            {isMenuPreview && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#faad14', color: '#000', textAlign: 'center', padding: '8px 16px', fontWeight: 600, fontSize: 14 }}>
                    Modo vista previa del menú — este menú no está publicado
                </div>
            )}
            <Navbardinamic />
            <main id="main" className={pageSlugClass}>
                <Suspense fallback={<div className="text-center py-20">Cargando sección...</div>}>
                 <Outlet />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
