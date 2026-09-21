import PropTypes from 'prop-types';
import { FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6'; // Ícono actualizado de X / Twitter

function ShareButtons({ url, title = "" }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      name: "Twitter",
      IconComponent: FaXTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "Facebook",
      IconComponent: FaFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      IconComponent: FaLinkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      IconComponent: FaWhatsapp,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  return (
    <div className="share-buttons flex gap-3">
      {links.map(({ name, IconComponent, href }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Compartir en ${name}`}
          className="share-icon text-gray-700 hover:text-purple-900 transition-colors"
        >
          <IconComponent size={24} />
        </a>
      ))}
    </div>
  );
}

ShareButtons.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default ShareButtons;