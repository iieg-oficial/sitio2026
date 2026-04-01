import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

export const Navbardinamic = () => {
  const [menuItems, setMenuItems] = useState([])
  const location = useLocation()

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(setMenuItems)
  }, [])

  return (
    <nav className="navbar">
      {menuItems.map(item => {
        const href = `/paginas/${item.slug}`
        const isActive = location.pathname === href

        return (
          <Link
            key={item.slug}
            to={href}
            className={`nav-link ${isActive ? 'active' : ''}`}
            target={item.open_in_new_tab ? '_blank' : '_self'}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}