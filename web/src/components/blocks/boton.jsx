import { Link } from 'react-router'
import TagManager from 'react-gtm-module'

const TrackedLink = ({ to, children, className, eventData = {}, target = '_self', rel = 'noopener noreferrer',  download,  onClick, }) => {
  const requiresBrowserNavigation =
    typeof to === 'string' && (
      to.startsWith('/datos-abiertos') ||
      /^(https?:|mailto:|tel:)/.test(to)
    )

const handleClick = (e) => {
    TagManager.dataLayer({
      dataLayer: {
        event: 'link_click',
        link_text: typeof children === 'string' ? children : 'link',
        link_destination: to,
        ...eventData
      }
    })
 
    if (onClick) onClick(e) // ejecuta el callback adicional (ej: cerrar el popup)
  }


  if (requiresBrowserNavigation || target !== '_self' || download) {
    return (
      <a href={to} 
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
      <Link to={to} className={className} onClick={handleClick}>
        {children}
      </Link>
  )
}

export default TrackedLink