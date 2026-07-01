# Deployment

Docker and platform configs live here so the repo root stays focused on application code.

## Local Docker

From the repository root:

```bash
cp .env.example .env.local
# fill in secrets, then:
docker compose -f deploy/docker-compose.yml up -d --build
# or
bash scripts/docker-run.sh
```

## Platforms

| Platform | Config |
|----------|--------|
| **Render** | Blueprint: `deploy/render.yaml` |
| **Fly.io** | Root `fly.toml` → `deploy/Dockerfile` |
| **VPS / GHCR** | `docker compose -f deploy/docker-compose.prod.yml up -d` |
| **Railway** | Point Dockerfile to `deploy/Dockerfile`, build context = repo root |

The Docker build context is always the **repository root** (`COPY . .` in `Dockerfile`).

## Production domain and email

Set these in production secrets / `.env.local` on the server:

| Variable | Production value |
|----------|------------------|
| `AUTH_URL` / `NEXTAUTH_URL` | `https://lakshyainternationaledwise.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://lakshyainternationaledwise.com` |
| `APP_COMPANY_EMAIL` | `support@lakshyainternationaledwise.com` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `support@lakshyainternationaledwise.com` |
| `WEBSITE_ENQUIRY_NOTIFY_EMAIL` | `support@lakshyainternationaledwise.com` |
| `SMTP_FROM` | `Lakshya International Edwise <support@lakshyainternationaledwise.com>` |

After deploy, run `npm run seed` or update **Settings → Company** in the CRM if the stored email still shows an old value.

`www.lakshyainternationaledwise.com` redirects to the apex domain automatically (see `next.config.ts`).
