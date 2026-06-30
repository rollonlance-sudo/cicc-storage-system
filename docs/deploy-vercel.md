# Deploying CICC Storage System to Vercel

> **Heads-up — Vercel is not a native Laravel host.** This setup runs Laravel on
> Vercel's community **PHP runtime** (`vercel-php`) as ephemeral serverless
> functions. Because serverless has **no persistent filesystem or database**, you
> must provide an **external MySQL** and **S3-compatible storage** (for file
> attachments). Cold starts and the 250 MB function limit apply. For a simpler,
> fully-supported deploy, prefer Railway, Render, Fly.io, or Laravel Cloud.

## What's already in the repo

- `vercel.json` — uses `vercel-php@0.7.4`, builds the Vite assets (`npm run build` → `public/build`), serves static files from `public/`, and rewrites everything else to the PHP function.
- `api/index.php` — serverless entrypoint; creates the writable storage dirs under `/tmp/storage` on cold start, then boots `public/index.php`.
- `bootstrap/app.php` — when the `VERCEL` env var is present, points Laravel's storage path at `/tmp/storage` (the only writable location).
- Attachments use the **default filesystem disk** (`config('filesystems.default')`), so setting `FILESYSTEM_DISK=s3` routes uploads to S3.

## 1. Provision external services (you own these)

1. **MySQL** — e.g. PlanetScale, Aiven, Railway, or any reachable MySQL 8. Note host, port, db name, user, password.
2. **S3 bucket** (for attachments) — AWS S3 or any S3-compatible store (Cloudflare R2, Backblaze B2). Note bucket, region, key, secret (and endpoint for non-AWS).

## 2. Set Vercel environment variables

In the Vercel project → Settings → Environment Variables (Production):

```
APP_NAME="CICC Storage System"
APP_ENV=production
APP_KEY=base64:...           # run `php artisan key:generate --show` locally and paste
APP_DEBUG=false
APP_URL=https://<your-app>.vercel.app

LOG_CHANNEL=stderr           # Vercel captures stdout/stderr

DB_CONNECTION=mysql
DB_HOST=<external-mysql-host>
DB_PORT=3306
DB_DATABASE=<db>
DB_USERNAME=<user>
DB_PASSWORD=<pass>
# If your provider requires TLS (PlanetScale/Aiven), set MYSQL_ATTR_SSL_CA to the CA path/bundle.

SESSION_DRIVER=cookie        # no DB round-trip; or `database` (sessions table is migrated)
CACHE_STORE=array            # ephemeral; or `database`
QUEUE_CONNECTION=sync

FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_DEFAULT_REGION=<region>
AWS_BUCKET=<bucket>
# AWS_ENDPOINT=<endpoint>    # for R2/B2/MinIO; AWS_USE_PATH_STYLE_ENDPOINT=true if needed
```

## 3. Deploy

```bash
npm i -g vercel
vercel login
vercel link               # link this folder to a Vercel project
vercel --prod             # build + deploy
```

The build runs `npm install && npm run build`; the `vercel-php` runtime installs
Composer dependencies for the function.

## 4. Initialize the database (one-time, against the external MySQL)

Run locally with your **production** DB credentials in the environment so it
migrates the remote database:

```bash
php artisan migrate --force
php artisan db:seed --force        # optional: roles + accounts + reference data + mock records
```

(Or run these via a Vercel one-off/CI step. The seeded admin is
`admin@storagesystem.test` / `password` — change it immediately.)

## Caveats & notes

- **Ephemeral storage:** anything written outside S3/DB (e.g. local-disk files, `/tmp`) does **not** persist between invocations. Attachments must use S3 (`FILESYSTEM_DISK=s3`).
- **No queues/scheduler** on Vercel — keep `QUEUE_CONNECTION=sync`.
- **`/index.php` source:** requests are rewritten to `api/index.php`; don't link directly to `/index.php`.
- **Config cache:** don't commit a `bootstrap/cache/config.php` baked with local values; Vercel reads env at runtime.
- If Vercel rejects the config, the most common fix is the `vercel-php` version — check the latest at https://github.com/vercel-community/php and bump `vercel.json`.
