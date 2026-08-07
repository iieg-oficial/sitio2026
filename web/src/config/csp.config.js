/**
 * csp.config.js
 * ------------------------------------------------------------------
 * Fuente única de verdad para la política de Content-Security-Policy
 * del sitio. Se usa para generar el <meta http-equiv="Content-Security-Policy">
 * en build time (o en runtime si el proyecto lo permite).
 *
 * Al agregar/quitar un origen permitido, modifica SOLO este archivo.
 * ------------------------------------------------------------------
 */

const isDev = process.env.NODE_ENV === "development";

/**
 * Política base, compartida por todos los entornos.
 * Mantener lo más restringido posible (principio de mínimo privilegio).
 */
const BASE_POLICY = {
  "default-src": ["'self'"],

  "img-src": [
    "'self'",
    "data:", // iconos/SVG inline del sistema de diseño
    "https://*.cartocdn.com", // mapas interactivos (Carto)
    "https://*.google-analytics.com", // píxel de tracking Analytics
    "https://*.googletagmanager.com", // recursos servidos por GTM
    "https://iieg.jalisco.gob.mx", // acervo de imágenes IIEG (mapoteca/mariachi)
  ],

  "media-src": [
    "'self'",
    "https://iieg.jalisco.gob.mx", // audio/video del mismo acervo, si aplica
  ],

  // Documentos/archivos descargables (pdf, docx, etc.) NO usan img-src;
  // si se abren en <a href> o <embed> deben ir en default-src/frame-src/object-src.
  "default-src-extra-note": undefined, // (placeholder documental, no es una directiva real)

  "script-src": [
    "'self'",
    "https://*.googletagmanager.com",
  ],

  "style-src": [
    "'self'",
    "'unsafe-inline'", // evaluar quitar si se logra mover estilos a archivos externos
  ],

  "font-src": ["'self'", "data:"],

  "connect-src": [
    "'self'",
    "https://*.google-analytics.com",
    "https://iieg.jalisco.gob.mx", // fetch/XHR a la API o archivos del acervo
  ],

  "object-src": ["'none'"], // bloquea <object>/<embed> (vector clásico de ataque)

  "base-uri": ["'self'"],
};

/**
 * Reglas SOLO de desarrollo. Nunca deben llegar a producción.
 */
const DEV_OVERRIDES = {
  "script-src": ["'unsafe-eval'", "http://localhost:*", "ws://localhost:*"], // hot-reload / HMR
  "connect-src": ["http://localhost:*", "ws://localhost:*"], // websocket del dev server
};

/**
 * Reglas SOLO de producción (gob.mx).
 * Aquí es donde, cuando exista acceso a cabecera HTTP, se agregará
 * frame-ancestors, report-uri/report-to, y upgrade-insecure-requests.
 */
const PROD_OVERRIDES = {
  "upgrade-insecure-requests": [], // fuerza HTTPS en subrecursos (directiva sin valores)
  // "frame-ancestors": ["'none'"], // ⚠️ requiere cabecera HTTP, el meta tag la ignora
  // "report-uri": ["https://tu-endpoint-de-reportes"], // ⚠️ requiere cabecera HTTP
};

/**
 * Combina dos objetos de política sumando arrays por directiva
 * (sin duplicados) en vez de sobrescribir.
 */
function mergePolicies(base, overrides) {
  const merged = { ...base };
  for (const [directive, sources] of Object.entries(overrides)) {
    const existing = merged[directive] || [];
    merged[directive] = Array.from(new Set([...existing, ...sources]));
  }
  return merged;
}

/**
 * Construye el string final listo para el atributo `content` del meta tag
 * o para la cabecera Content-Security-Policy.
 */
function buildCSPString(policy) {
  return Object.entries(policy)
    .filter(([directive]) => !directive.startsWith("default-src-extra-note")) // ignora notas documentales
    .map(([directive, sources]) =>
      sources.length ? `${directive} ${sources.join(" ")}` : directive
    )
    .join("; ");
}

const CSP_POLICY = mergePolicies(BASE_POLICY, isDev ? DEV_OVERRIDES : PROD_OVERRIDES);

export { CSP_POLICY, buildCSPString, BASE_POLICY, DEV_OVERRIDES, PROD_OVERRIDES };