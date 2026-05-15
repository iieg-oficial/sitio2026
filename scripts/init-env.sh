#!/usr/bin/env bash
set -euo pipefail

# Crea .env.development y .env.production desde sus .example si no existen,
# y rellena los secretos con valores generados aleatoriamente.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

gen_hex() { openssl rand -hex 32; }
gen_pwd() { openssl rand -base64 24 | tr -d '/+=' | head -c 32; }
gen_sysadmin_pwd() { openssl rand -base64 18 | tr -d '/+=' | head -c 24; }

# Patrones <placeholder> que necesitan secretos generados
fill_secrets() {
    local file="$1"
    local tmp
    tmp="$(mktemp)"

    sed \
        -e "s|<postgres_password>|$(gen_pwd)|" \
        -e "s|<secret_key>|$(gen_hex)|" \
        -e "s|<csrf_secret_key>|$(gen_hex)|" \
        -e "s|<ckan_db_superuser_password>|$(gen_pwd)|" \
        -e "s|<ckan_db_password>|$(gen_pwd)|" \
        -e "s|<datastore_ro_password>|$(gen_pwd)|" \
        -e "s|<ckan_sysadmin_password>|$(gen_sysadmin_pwd)|" \
        -e "s|<ckan_beaker_session_secret>|$(gen_hex)|" \
        -e "s|<ckan_api_token_jwt_secret>|$(gen_hex)|" \
        "$file" > "$tmp"

    mv "$tmp" "$file"
    echo "✓ Secretos generados en $file"
}

create_env() {
    local target="$1" example="$2"
    if [ -f "$target" ]; then
        echo "  $target ya existe — se conserva"
        return 0
    fi
    if [ ! -f "$example" ]; then
        echo "  ⚠ $example no existe, no se puede crear $target"
        return 1
    fi
    cp "$example" "$target"
    echo "✓ Creado $target desde $example"
    fill_secrets "$target"
    echo "  ⚠ Aún tiene placeholders <...> para URLs, puertos, credenciales del Acervo y branding. Edítalos."
}

create_env ".env.development" ".env.development.example"
create_env ".env.production" ".env.production.example"
