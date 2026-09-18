/**
 * web/config/csp.config.js
 * ------------------------------------------------------------------
 * Fuente única de verdad para la política de Content-Security-Policy
 * del sitio público (portal). Se usa para generar:
 *   1. El <meta http-equiv="Content-Security-Policy"> en index.html (vía vite.config.js)
 *   2. El snippet de cabecera Nginx (dist/csp-header.conf, vía scripts/generate-csp-nginx.js)
 *
 * Al agregar/quitar un dominio permitido, modifica SOLO este archivo.
 * ------------------------------------------------------------------
 */

const APP_ENV = process.env.VITE_APP_ENV || process.env.NODE_ENV || "production";
const isDev = APP_ENV === "development";
const isStaging = APP_ENV === "staging";

const BASE_POLICY = {
  "default-src": ["'self'"],

  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://*.cartocdn.com",
    "https://*.google-analytics.com",
    "https://*.googletagmanager.com",
    "https://iieg.jalisco.gob.mx", // acervo de imágenes IIEG (mapoteca/mariachi)
  ],

  "media-src": ["'self'", "https://iieg.jalisco.gob.mx"],

  "script-src": ["'self'", "https://*.googletagmanager.com"],

  "style-src": ["'self'", "'unsafe-inline'"],

  "font-src": ["'self'", "data:"],

  "connect-src": [
    "'self'",
    "https://analytics.google.com",
    "https://*.analytics.google.com",
    "https://*.google-analytics.com",
    "https://*.googletagmanager.com",
    "https://*.cartocdn.com",
    "https://iieg.jalisco.gob.mx",
  ],

  "object-src": ["'none'"],

  "base-uri": ["'self'"],
};

const DEV_OVERRIDES = {
  "script-src": ["'unsafe-eval'", "http://localhost:*", "ws://localhost:*"],
  "connect-src": ["http://localhost:*", "ws://localhost:*"],
};

const PROD_OVERRIDES = {
  "upgrade-insecure-requests": [],
};

const STAGING_OVERRIDES = {
  ...PROD_OVERRIDES,
};

function mergePolicies(base, overrides) {
  const merged = { ...base };
  for (const [directive, sources] of Object.entries(overrides)) {
    const existing = merged[directive] || [];
    merged[directive] = Array.from(new Set([...existing, ...sources]));
  }
  return merged;
}

function buildCSPString(policy) {
  return Object.entries(policy)
    .map(([directive, sources]) =>
      sources.length ? `${directive} ${sources.join(" ")}` : directive
    )
    .join("; ");
}

function getOverridesForEnv() {
  if (isDev) return DEV_OVERRIDES;
  if (isStaging) return STAGING_OVERRIDES;
  return PROD_OVERRIDES;
}

export const CSP_POLICY = mergePolicies(BASE_POLICY, getOverridesForEnv());

export { buildCSPString, BASE_POLICY, DEV_OVERRIDES, STAGING_OVERRIDES, PROD_OVERRIDES, APP_ENV };