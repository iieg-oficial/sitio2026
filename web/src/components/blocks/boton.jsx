// TrackedLink.jsx
import { Link } from 'react-router';

export default function TrackedLink({ to = '#', children, className, onClick, ...props }) {
  const handleClick = (e) => {
    // 1. Envío seguro a GTM (sin invocar funciones inexistentes del paquete react-gtm)
    try {
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'link_click',
          link_text: typeof children === 'string' ? children : 'menu_link',
          link_destination: to,
        });
      }
    } catch (err) {
      console.warn("GTM push error:", err);
    }

    // 2. Validación estricta antes de invocar cualquier onClick
    if (typeof onClick === 'function') {
      onClick(e);
    }
  };

  // Si es enlace externo
  if (typeof to === 'string' && (to.startsWith('http://') || to.startsWith('https://'))) {
    return (
      <a href={to} className={className} onClick={handleClick} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  // Navegación interna con React Router
  return (
    <Link to={to} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}