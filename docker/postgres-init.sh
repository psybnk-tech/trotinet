#!/bin/sh
set -eu

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=ON_ERROR_STOP=1 \
  --set=app_password="$DB_APP_PASSWORD" <<'SQL'
CREATE ROLE trotinet_app LOGIN PASSWORD :'app_password';
GRANT CONNECT ON DATABASE trotinet TO trotinet_app;
ALTER SCHEMA public OWNER TO trotinet_app;
SQL