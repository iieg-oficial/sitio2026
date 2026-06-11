import { useContext } from 'react';
import { Outlet } from 'react-router';
import Footer from '@components/Footer';
import GlobalContext from '@contexts/GlobalContext';
import Navbardinamic from '@components/menu/Navbardinamic';
import { useScrollToHash } from "@hooks/useScrollToHash";

const MainLayout = () => {
    const { isMenuPreview } = useContext(GlobalContext);
    useScrollToHash();

    return (
        <div className="">
            {isMenuPreview && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#faad14', color: '#000', textAlign: 'center', padding: '8px 16px', fontWeight: 600, fontSize: 14 }}>
                    Modo vista previa del menú — este menú no está publicado
                </div>
            )}
            <Navbardinamic />
            <main id="main" className="">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
