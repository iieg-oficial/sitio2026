import { Link } from 'react-router'
import TagManager from 'react-gtm-module'

const TrackedLink = ({ to, children, className, eventData = {}, target = '_self', rel = 'noopener noreferrer' }) => {
  const requiresBrowserNavigation =
    typeof to === 'string' && (
      to.startsWith('/datos-abiertos') ||
      /^(https?:|mailto:|tel:)/.test(to)
    )

  const handleClick = () => {
    TagManager.dataLayer({
      dataLayer: {
        event: 'link_click',
        link_text: typeof children === 'string' ? children : 'link',
        link_destination: to,
        ...eventData // permite agregar datos extra si necesitas
      }
    })
  }

  if (requiresBrowserNavigation || target !== '_self') {
    return (
      <a href={to} className={className} onClick={handleClick} target={target} rel={rel}>
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