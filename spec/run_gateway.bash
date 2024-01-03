#!/bin/bash

CONFIG_FILE="/usr/share/nginx/html/config.js"

# ----- Begin instance config creation --------------------------------
echo "[epivar] [entrypoint] writing ${CONFIG_FILE}"
node /create_config_prod.js  # Echo out to logs
node /create_config_prod.js > "${CONFIG_FILE}"
# ----- End -----------------------------------------------------------

echo "[epivar] [entrypoint] starting NGINX"
nginx -g 'daemon off;'
