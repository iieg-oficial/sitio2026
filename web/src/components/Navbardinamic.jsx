import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'
import TrackedLink from '@components/blocks/boton'

export const Navbardinamic = () => {
  const [menuItems, setMenuItems] = useState([])
  const location = useLocation()

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await api.get('/paginas');
        setMenuItems(response.data.pages);
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
        const linkinterno = item.link_interno ? item.link_interno : false

        return (
          <TrackedLink
            key={item.slug}
            to={item.slug_custom}
            className={`nav-link ${isActive ? 'active' : ''}`}
            target={linkinterno ? '_self' : '_blank'}
          >
            {item.title}
          </TrackedLink>
        )
      })}
    </nav>
  )
}