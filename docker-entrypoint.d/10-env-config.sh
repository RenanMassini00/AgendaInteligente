#!/bin/sh
set -eu

api_url="${VITE_API_URL-https://macroloapp.com.br}"

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__APP_CONFIG__ = {
  VITE_API_URL: "$(json_escape "$api_url")"
};
EOF
