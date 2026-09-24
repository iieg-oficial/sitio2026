/**
 * web/config/csp.config.js
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
    "https://google-analytics.com",
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://analytics.google.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    "https://iieg.jalisco.gob.mx",
    "https://i.ytimg.com", // Muestra miniaturas de YouTube si aplica
  ],

  "media-src": ["'self'", "https://iieg.jalisco.gob.mx"],

  "script-src": [
    "'self'", 
    "'unsafe-inline'", // Permite la ejecución del snippet inline de GTM
    "https://*.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://ssl.google-analytics.com"
  ],

  "style-src": ["'self'", "'unsafe-inline'"],

  "font-src": ["'self'", "data:"],

  "connect-src": [
    "'self'",
    "https://analytics.google.com",
    "https://*.analytics.google.com",
    "https://google-analytics.com",
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://*.googletagmanager.com",
    "https://*.cartocdn.com",
    "https://iieg.jalisco.gob.mx",
  ],

  // Permite incrustar reproductores de YouTube (estándar y no-cookie)
  "frame-src": [
    "'self'",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com"
  ],

  "object-src": ["'none'"],

  "base-uri": ["'self'"],
};

const DEV_OVERRIDES = {
  "script-src": ["'unsafe-inline'", "'unsafe-eval'", "http://localhost:*", "ws://localhost:*"],
  "connect-src": ["http://localhost:*", "ws://localhost:*"],
};

const PROD_OVERRIDES = {
  "upgrade-insecure-requests": [],
};

const STAGING_OVERRIDES = {
  ...PROD_OVERRIDES,
};

function mergePolicies(base, overrides) {
  const merged = {};

  for (const [directive, sources] of Object.entries(base)) {
    merged[directive] = [...sources];
  }

  for (const [directive, sources] of Object.entries(overrides)) {
    const existing = merged[directive] || [];
    merged[directive] = Array.from(new Set([...existing, ...sources]));
  }

  return merged;
}

function buildCSPString(policy) {
  return Object.entries(policy)
    .map(([directive, sources]) => {
      if (Array.isArray(sources) && sources.length > 0) {
        return `${directive} ${sources.join(" ").trim()}`;
      }
      return directive.trim();
    })
    .filter(Boolean)
    .join("; ");
}

function getOverridesForEnv() {
  if (isDev) return DEV_OVERRIDES;
  if (isStaging) return STAGING_OVERRIDES;
  return PROD_OVERRIDES;
}

export const CSP_POLICY = mergePolicies(BASE_POLICY, getOverridesForEnv());

export { buildCSPString, BASE_POLICY, DEV_OVERRIDES, STAGING_OVERRIDES, PROD_OVERRIDES, APP_ENV };