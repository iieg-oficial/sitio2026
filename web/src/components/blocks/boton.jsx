import { Link } from 'react-router'
import TagManager from 'react-gtm-module'

const TrackedLink = ({ 
    to = '#', children, className, eventData = {}, target = '_self', rel = 'noopener noreferrer',  download,  onClick, }) => {

  const destination = typeof to === 'string' && to ? to : '#'

  const requiresBrowserNavigation =
    typeof to === 'string' && (
      to.startsWith('/datos-abiertos') ||
      /^(https?:|mailto:|tel:)/.test(destination)
    )

const handleClick = (e) => {
    // Si 'children' es JSX (un objeto), extraemos un texto genérico de fallback
    const linkText = typeof children === 'string' ? children : 'tracked_element'

    try {
      TagManager.dataLayer({
        dataLayer: {
          event: 'link_click',
          link_text: linkText,
          link_destination: destination,
          ...eventData
        }
      })
    } catch (err) {
      console.warn("GTM DataLayer error:", err)
    }
 
    if (onClick) onClick(e) // ejecuta el callback adicional (ej: cerrar el popup)
  }


  if (requiresBrowserNavigation || target !== '_self' || download) {
    return (
      <a href={destination} 
      className={className} 
      onClick={handleClick} 
      target={target} 
      rel={rel}
      download={download}>
        {children}
      </a>
    )
  }

  return (
      <Link to={destination} className={className} onClick={handleClick}>
        {children}
      </Link>
  )
}

export default TrackedLink