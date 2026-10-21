# Trotinet Pieces

Arabic-first, RTL catalog and inquiry site for electric scooter spare parts in Morocco. This is a product showcase, not a checkout or payment-processing store. Demo catalog cards are explicitly marked as examples and are not inventory, compatibility, or price claims.

## Stack

- Next.js 16, React 19, TypeScript
- PostgreSQL 17, Prisma 7, exact `Decimal(10,2)` prices
- Zod request validation, signed HttpOnly admin session cookies
- Docker Compose, Next standalone production output

## Local Setup

Requirements: Node.js 24+, npm 11+, Docker Compose v2, and OpenSSL.

1. Install dependencies and create local configuration:

	```sh
	npm ci
	cp .env.example .env
	```

2. Generate unique database passwords and a session secret. Use hexadecimal passwords for the Compose database URL so reserved URL characters cannot be misread:

	```sh
	openssl rand -hex 32
	openssl rand -hex 32
	openssl rand -hex 32
	```

	Put the first value in `POSTGRES_PASSWORD`, the second in `DB_APP_PASSWORD`, and the third in `SESSION_SECRET`. `SESSION_SECRET` must be at least 32 bytes. Set `ADMIN_EMAIL` and `APP_URL` in `.env`.

3. Generate the admin password hash. The prompt does not echo the password. Add the printed `ADMIN_PASSWORD_HASH=...` value to `.env` without quotes:

	```sh
	npm run admin:hash
	```

	Choose a unique password with at least 14 characters. There is no public registration route.

4. Start PostgreSQL. It has no public network binding; its port is exposed only on loopback for local development. The init script creates a separate, non-superuser app role:

	```sh
	docker compose up -d db
	```

5. Set `DATABASE_URL` in `.env` to use the local port and app credentials:

	```text
	postgresql://trotinet_app:<DB_APP_PASSWORD>@localhost:5432/trotinet?schema=public
	```

6. Apply the checked-in migration, seed editable starter categories, and launch:

	```sh
	npm run db:generate
	npm run db:migrate
	npm run db:seed
	npm run dev
	```

	Open `http://localhost:3000`; the admin login is at `/admin`.

The category seed is repeatable and never creates sample stock. To run the full production-like stack instead, complete `.env` setup and use `docker compose up --build -d`. The app container migrates the database before starting and uses the internal Docker network.

## Catalog Operations

- `/admin` requires the configured email, scrypt password hash, and `SESSION_SECRET`. Admin data changes are authorized in route handlers, not just hidden in the interface.
- Add a category first, then create a product with a unique slug and SKU. Publish only after its facts are checked.
- Product price is optional. Public display also requires the store-level price toggle. Leave availability as “ask seller” until verified.
- Compatibility is only shown on product detail pages when a verified relation exists. The starter admin form intentionally does not make compatibility or specifications up; maintain those via a reviewed, authenticated database workflow until the dedicated editor is added.
- Product upload accepts up to eight JPEG, PNG, or WebP images, at 5 MB each. SVG and arbitrary external image URLs are not accepted. Files are signature-checked and stored outside the public directory.
- `WHATSAPP_PHONE` defaults to the owner-provided `0669978386` in `.env.example`; a number saved in admin store settings overrides it. Local numbers beginning with `0` are normalized to `212` when creating `wa.me` links. Replace this default if it is not the shop's contact number.
- Configure location, map, hours, delivery notes, and MAD price visibility in settings. Only verified business details should be published.
- Catalog cards on an empty database are visual examples with `EXEMPLE-` references. They never submit an inquiry with a fabricated product ID.

Public inquiry submissions are rate-limited, same-origin checked, validated, and protected by a honeypot. Contact details are shown only in the admin dashboard. No payment or external messaging service is configured, and saved inquiries do not trigger email/WhatsApp notifications.

## Deployment

The production image is multi-stage, runs as a non-root user, contains the production dependencies, and uses Next standalone output. PostgreSQL is not published outside the Docker network. The web port binds to `127.0.0.1` by default; put a TLS-terminating reverse proxy in front of it, expose only HTTPS publicly, and leave the database port closed at the host firewall. Set `APP_URL` to the public HTTPS origin. Do not commit `.env` or put secrets in build arguments.

The first `docker compose up --build -d` runs the database init script and migration command. Back up both PostgreSQL and uploaded images:

```sh
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backup.sql
docker compose cp web:/app/uploads ./uploads-backup
```

Restore to the intended database only after checking the target and keeping a current backup:

```sh
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"' < backup.sql
```

Also restore the image directory to the configured `UPLOAD_PATH`. Keep encrypted, off-host backups and test restoration regularly. For rollback, deploy the previous application image and restore the corresponding database/image backup if a migration was not backward compatible; Prisma migrations are forward-only here. Do not drop the production volume as a rollback method.

For uploads on a bind-mounted host directory, ensure the directory exists and is writable by the container user (UID/GID 1001). The app upload path defaults to `/app/uploads`. Proxy configuration must strip client-supplied `X-Forwarded-For` and set trusted forwarding headers; the rate limiter hashes this address and retains only short-lived rate buckets. Set up a monitored, off-host retention/deletion process for customer inquiries; there is no scheduled retention job in this MVP.

## Checks

```sh
npm run db:generate
npm run typecheck
npm test
npm audit --audit-level=high
npm run build
```

CI runs dependency audit, client generation, type checks, unit validation tests, and a production build. The current unit tests cover request validation. A live PostgreSQL integration suite, browser-driven end-to-end suite, screen-reader audit, and visual viewport checks still need to be run before a public launch.

## Current Boundaries

- Live catalog and inquiries require PostgreSQL. If the database is unavailable, the storefront deliberately falls back to labeled visual examples; those examples are never persisted.
- Admin product editor currently covers basic fields, availability, publishing, price, category, description, and images. Product specification/compatibility editing, sale price, advanced SEO fields, inquiry search/pagination, and inquiry retention controls remain follow-up work.
- WhatsApp is an outbound link only. No messaging account, map provider, email transport, or cloud image storage is configured.
- The deployment uses a loopback-only app binding for a local reverse proxy. Configure TLS, backups, firewall rules, monitoring, and secret rotation on the chosen host before serving customers.
# trotinet