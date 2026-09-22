import { useEffect, useState } from 'react';
import api from '@services/apiService';
import TrackedLink from '@components/blocks/boton';
import './Navbardinamic.css';

const NavbarFooter = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMenuItems = async () => {
      try {
        const response = await api.get('/paginas');
        if (isMounted) {
          setMenuItems(response.data?.pages || []);
        }
      } catch (error) {
        console.error('Error al obtener los items:', error);
      }
    };

    fetchMenuItems();

    return () => {
      isMounted = false;
    };
  }, []); 

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Botón de Hamburguesa */}
      <button 
        className={`nav-toggle ${isOpen ? 'is-active' : ''}`} 
        onClick={toggleMenu}
        aria-label="Abrir menú"
      >
        <span></span>
      </button>

      {/* Lista de Menú */}
      <ul className={`nav-menu ${isOpen ? 'nav-menu_visible' : ''}`}>
        {menuItems
          .filter((item) => item && item.parent_id === null)
          .map((item) => (
            <li key={item.id} className="nav-menu-item">
              <TrackedLink
                to={item.slug_custom}
                className="nav-link"
                target={item.link_interno ? '_self' : '_blank'}
                onClick={closeMenu}
              >
                {item.title}
              </TrackedLink>
              
              {/* Subpáginas (si existen) */}
              {Array.isArray(item.subpages) && item.subpages.length > 0 && (
                <ul className="sub-menuf pl-5">
                  {item.subpages.map((subItem) => (
                    <li key={subItem.id}>
                      <TrackedLink 
                        to={subItem.slug_custom} 
                        className="nav-link"
                        onClick={closeMenu}
                      >
                        -- {subItem.title}
                      </TrackedLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
      </ul>
    </nav>
  );
};

export default NavbarFooter;