/**
 * web/scripts/generate-csp-nginx.js
 * ------------------------------------------------------------------
 * Genera dist/csp-header.conf a partir de web/config/csp.config.js
 * Se ejecuta DENTRO del contenedor Docker durante el build (etapa web-builder),
 * después de "vite build", para que el archivo quede incluido cuando
 * el Dockerfile copie /app/dist a /usr/share/nginx/html.
 *
 * Uso local (dentro de web/):
 *   node scripts/generate-csp-nginx.js
 * ------------------------------------------------------------------
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { CSP_POLICY, buildCSPString } from "../config/csp.config.js";

// Se sanitiza la cadena eliminando saltos de línea internos (\r, \n) y dobles espacios
const csp = buildCSPString(CSP_POLICY)
  .replace(/[\r\n]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

// Se asegura que los saltos de línea del archivo sean estrictamente \n (LF)
const nginxSnippet = [
  "# ------------------------------------------------------------------",
  "# Generado automáticamente desde web/config/csp.config.js",
  "# NO EDITAR A MANO — correr: node scripts/generate-csp-nginx.js",
  "# ------------------------------------------------------------------",
  `add_header Content-Security-Policy "${csp}" always;`,
  ""
].join("\n");

if (!existsSync("dist")) {
  mkdirSync("dist");
}

if (csp.includes('"')) {
  throw new Error("CSP string contiene comillas dobles, revisa csp.config.js");
}

writeFileSync("dist/csp-header.conf", nginxSnippet, "utf-8");
console.log("✅ Snippet Nginx generado en dist/csp-header.conf");
console.log(csp);