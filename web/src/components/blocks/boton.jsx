import { Link } from 'react-router'
import TagManager from 'react-gtm-module'

const TrackedLink = ({ to, children, className, eventData = {}, target = '_self', rel = 'noopener noreferrer' }) => {
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
  return (
    
      <Link to={to} className={className} onClick={handleClick} target={target} rel="noopener noreferrer">
        {children}
      </Link>
    
  )
}

export default TrackedLink