import { Icon } from "@iconify/react";
import PropTypes from 'prop-types';

function ShareButtons({ url, title = ""}) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      name: "Twitter",
      icon: "mdi:twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "Facebook",
      icon: "mdi:facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: "mdi:linkedin",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      icon: "mdi:whatsapp",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  return (
    <div className="share-buttons">
      {links.map(({ name, icon, href }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Compartir en ${name}`}
          className="share-icon"
        >
          <Icon icon={icon} width="24" height="24" />
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