import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import api from '@services/apiService';
import TrackedLink from '@components/blocks/boton';
import './Navbardinamic.css';
import HeaderSearch from '@components/HeaderSearch';

const sortByOrder = (a, b) => {
  const orderA = Number.isInteger(a?.order) ? a.order : Number.MAX_SAFE_INTEGER;
  const orderB = Number.isInteger(b?.order) ? b.order : Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) return orderA - orderB;
  return (a?.id || 0) - (b?.id || 0);
};

// Helper seguro para garantizar que las rutas internas tengan el formato adecuado
const cleanSlug = (slug) => {
  if (!slug) return '/';
  if (slug.startsWith('http://') || slug.startsWith('https://')) return slug;
  return slug.startsWith('/') ? slug : `/${slug}`;
};

const Navbardinamic = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenus, setActiveSubmenus] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Lógica de Carga de Datos
  useEffect(() => {
    let isMounted = true;
    const fetchMenuItems = async () => {
      try {
        const response = await api.get('/paginas');
        const pages = response.data?.pages || response.data || [];
        if (isMounted) {
          setMenuItems(Array.isArray(pages) ? pages : []);
        }
      } catch (error) {
        console.error('Error al obtener los items del menú:', error);
      }
    };
    fetchMenuItems();
    return () => { isMounted = false; };
  }, []);

  
  // 2. Funciones para alternar menú y submenús
  const toggleMenu = (e) => {
    if (e) e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  const toggleSubmenu = (e, id) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveSubmenus((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 3. Cerrar menú automáticamente cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false);
    setActiveSubmenus({});
  }, [location.pathname]);

  const handleSearch = (term) => {
    if (!term) {
      navigate('/busqueda/');
      return;
    }
    navigate(`/busqueda?q=${encodeURIComponent(term)}`);
  };

  // Helper para verificar si un slug corresponde a la ruta activa actual
  const isPathActive = (slug) => {
    if (!slug) return false;
    const path = cleanSlug(slug);
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="container-fluid bg-primary py-5">
      <div className="menu-wrapper grid grid-cols-2 xl:grid-cols-12 container mx-auto">
        <Link to="/" className="lg:col-span-3 xl:col-span-2 content-center">
          <img src="/ico_IIEG_header.svg" alt="IIEG" className="h-12 w-auto" />
        </Link>
        
        <a 
          href="#menu" 
          className={`menu-link text-right ${isOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
        >
          <span className="material-symbols--menu-rounded"></span>
        </a>

        <nav id="menu" className={`navbar col-span-2 lg:col-span-9 xl:col-span-10 ${isOpen ? 'active' : ''}`} role="navigation">
          <div className="menu">
            <ul className="menu">

              {menuItems
                .filter((item) => item && item.parent_id === null && item.activar === true)
                .sort(sortByOrder)
                .map((item) => {
                  const hasSubpages = Array.isArray(item.subpages) && item.subpages.length > 0;
                  const destination = cleanSlug(item.slug_custom);

                  const isItemActive = isPathActive(item.slug_custom);
                  const isChildActive = hasSubpages && item.subpages.some(
                    (sub) => sub && sub.activar === true && isPathActive(sub.slug_custom)
                  );
                  const isCurrent = isItemActive || isChildActive;

                  return (
                    <li key={item.id} className={`menu-link ${hasSubpages ? 'has-subnav' : ''} ${isCurrent ? 'current-menu-item active' : ''}`}>
                      <TrackedLink
                        to={destination}
                        className={isCurrent ? 'active' : ''}
                        target={item.link_interno ? undefined : '_blank'}
                      >
                        {item.title}
                      </TrackedLink>
                              
                      {/* Toggle para submenús en móviles */}
                      {hasSubpages && (
                        <span 
                          className={`toggle-link ${activeSubmenus[item.id] ? 'active' : ''}`}
                          onClick={(e) => toggleSubmenu(e, item.id)}
                        ></span>
                      )}

                      {/* Subpáginas (si existen) */}
                      {hasSubpages && (
                        <ul className={`sub-menu ${activeSubmenus[item.id] ? 'active' : ''}`}>
                          {item.subpages
                            .filter((subItem) => subItem && subItem.activar === true)
                            .sort(sortByOrder)
                            .map((subItem) => {
                              const subDestination = cleanSlug(subItem.slug_custom);
                              const isSubActive = isPathActive(subItem.slug_custom);

                              return (
                                <li key={subItem.id} className={isSubActive ? 'active' : ''}>
                                  <TrackedLink 
                                    to={subDestination}
                                    className={`nav-link ${isSubActive ? 'active' : ''}`} 
                                    target={subItem.link_interno ? undefined : '_blank'}
                                  >
                                    {subItem.title}
                                  </TrackedLink>
                                </li>
                              );
                            })}
                        </ul>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        </nav>    
 
      </div>
    </div>
  );
};

export default Navbardinamic;