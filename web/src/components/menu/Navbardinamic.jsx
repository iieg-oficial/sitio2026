import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'
import TrackedLink from '@components/blocks/boton'
import './Navbardinamic.css'

const Navbardinamic = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // ESTADO: Controla si el menú se ve o no
  const [activeSubmenus, setActiveSubmenus] = useState({}); // Controla submenús abiertos
  const location = useLocation();

  // 1. Lógica de Carga de Datos
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await api.get('/paginas');
        setMenuItems(response.data.pages);
      } catch (error) {
        console.error('Error al obtener los items:', error);
      }
    };
    fetchMenuItems();
  }, [location]);

  // 2. Función para alternar el menú (El reemplazo de tu Toggle JS)
  const toggleMenu = (e) => {
    if (e) e.preventDefault();
    setIsOpen(!isOpen);
  };

  const toggleSubmenu = (e, id) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveSubmenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 3. Cerrar menú automáticamente cuando cambias de ruta
  useEffect(() => {
    setIsOpen(false);
    setActiveSubmenus({});
  }, [location]);

  return (
    <div className="menu-wrapper grid grid-cols-2">
      <Link to="/" className="">
        <img src="/logo_iieg.svg" alt="IIEG" className="h-12 w-auto" />
      </Link>
      <a href="#menu" className={`menu-link text-right ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span className="ico-caret-down right" aria-hidden="true">M</span>
      </a>
      <nav id="menu" className={`navbar col-span-2 ${isOpen ? 'active' : ''}`} role="navigation">
        <div className="menu">
          <ul className="menu">
            <li key="home" className="current-menu-item">
              <TrackedLink to="/">Inicio</TrackedLink>
              </li>
            {menuItems
              .filter(item => item.parent_id === null) // Filtro de padres para evitar duplicados
              .map(item => (
                <li key={item.id} className={`menu-link ${item.subpages && item.subpages.length > 0 ? 'has-subnav' : ''}`}>
                  <TrackedLink
                    to={item.slug_custom}
                    target={item.link_interno ? '_self' : '_blank'}
                    className=""
                  >
                    {item.title}
                  </TrackedLink>
                          
                  {/* Toggle para submenús en móviles */}
                  {item.subpages && item.subpages.length > 0 && (
                    <span 
                      className={`toggle-link ${activeSubmenus[item.id] ? 'active' : ''}`}
                      onClick={(e) => toggleSubmenu(e, item.id)}
                    ></span>
                  )}

                  {/* Subpáginas (si existen) */}
                  {item.subpages && item.subpages.length > 0 && (
                    <ul className={`sub-menu ${activeSubmenus[item.id] ? 'active' : ''}`}>
                      {item.subpages.map(subItem => (
                        <li key={subItem.id}>
                          <TrackedLink to={subItem.slug_custom} className="nav-link">
                            {subItem.title}
                          </TrackedLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
          </ul>
        </div>
          
      </nav>    
    </div>
  );
};

export default Navbardinamic;