import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'
import TrackedLink from '@components/blocks/boton'
import './Navbardinamic.css'

const NavbarFooter = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // ESTADO: Controla si el menú se ve o no
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
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // 3. Cerrar menú automáticamente cuando cambias de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

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

      {/* Lista de Menú: La clase cambia según el estado 'isOpen' */}
      <ul className={`nav-menu ${isOpen ? 'nav-menu_visible' : ''}`}>
        {menuItems
          .filter(item => item.parent_id === null) // Filtro de padres para evitar duplicados
          .map(item => (
            <li key={item.id} className="nav-menu-item">
              <TrackedLink
                to={item.slug_custom}
                className="nav-link"
                target={item.link_interno ? '_self' : '_blank'}
              >
                {item.title}
              </TrackedLink>
              
              {/* Subpáginas (si existen) */}
              {item.subpages && item.subpages.length > 0 && (
                <ul className="sub-menuf pl-5">
                  {item.subpages.map(subItem => (
                    <li key={subItem.id}>
                      <TrackedLink to={subItem.slug_custom} className="nav-link">
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