#!/bin/sh
set -eu

api_url="${VITE_API_URL-http://2.25.147.236:5000}"

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__APP_CONFIG__ = {
  VITE_API_URL: "$(json_escape "$api_url")"
};
EOF
