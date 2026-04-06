import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'

export const Navbardinamic = () => {
  const [menuItems, setMenuItems] = useState([])
  const location = useLocation()

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await api.get('/paginas');
        setMenuItems(response.data);
      } catch (error) {
        console.error('Error al obtener los items del menú:', error);
      }
    }
    fetchMenuItems();
  }, [location])

  return (
    <nav className="navbar">
      {menuItems.map(item => {
        const href = `/${item.slug}`
        const isActive = location.pathname === href

        return (
          <Link
            key={item.slug}
            to={href}
            className={`nav-link ${isActive ? 'active' : ''}`}
            target={item.open_in_new_tab ? '_blank' : '_self'}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}