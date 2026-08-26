import React from 'react';
import DOMPurify from 'dompurify';

export const SafeHtml = ({ htmlContent, className }) => {
  // Configuración estricta: limpia etiquetas <script> y atributos dañinos en SVGs u HTML
  const cleanHtml = DOMPurify.sanitize(htmlContent, {
    USE_PROFILES: { html: true, svg: true }
  });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

