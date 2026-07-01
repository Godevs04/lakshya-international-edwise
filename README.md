# Lakshya International Edwise CRM

Production-grade, white-label-ready education/loan consultancy CRM built with Next.js, MongoDB, and Auth.js.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** + **Framer Motion**
- **MongoDB Atlas** + **Mongoose**
- **Auth.js (NextAuth v5)** — JWT, RBAC
- **Cloudinary** — file uploads
- **TanStack Table** + **Recharts**
- **React Hook Form** + **Zod**

## Getting Started

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Fill in your MongoDB Atlas URI, Auth secret, Cloudinary, and SMTP credentials in `.env.local`. For local dev, override `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` with `http://localhost:4000`.

**Production domain:** `https://lakshyainternationaledwise.com` — see [`.env.example`](.env.example) and [`deploy/README.md`](deploy/README.md) for required production env vars and support email (`support@lakshyainternationaledwise.com`).

3. Install dependencies and seed the database:

```bash
npm install
npm run seed
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:4000](http://localhost:4000) and sign in with your seed admin credentials.

## Features

- Premium SaaS dashboard with real-time MongoDB aggregations
- Student CRM with full lifecycle status flow
- Partner management with commission tracking
- Application pipeline (Kanban + Table views)
- Reports (Daily/Weekly/Monthly/Yearly) with CSV export
- Analytics (funnel, trends, demographics, heat map)
- Global search (Cmd+K)
- Role-based access control (Super Admin → Viewer)
- White-label settings (logo, company name, theme, modules)
- Activity & audit logging
- Dark / Light / System theme

## User Roles

| Role | Access |
|------|--------|
| Super Admin | Full access |
| Admin | All modules + user management |
| Manager | CRUD + reports + analytics |
| Staff | Students + applications |
| Viewer | Read-only |

## White-Label Configuration

Change branding for future clients via **Settings** without code changes:

- Company name, logo, contact
- Theme colors and mode
- Enable/disable modules

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run seed` | Seed roles, settings, super admin |

## Deployment Options

The app ships with **Docker** and supports multiple hosting platforms (not only Vercel).

| Platform | How to deploy |
|----------|----------------|
| **Docker / VPS** | `docker compose -f deploy/docker-compose.yml up -d` or `bash scripts/docker-run.sh` |
| **GitHub Container Registry** | **Actions → Deploy Application → Run workflow** → platform `docker` |
| **Fly.io** | `fly deploy` (root `fly.toml` → `deploy/Dockerfile`) |
| **Render** | Connect repo and use `deploy/render.yaml` blueprint |
| **Railway** | Connect repo — set Dockerfile to `deploy/Dockerfile`, build context = repo root |
| **VPS (SSH)** | Run Deploy Application with platform `vps` + SSH/GHCR secrets (see below) |
| **Vercel** | Run Deploy Application with platform `vercel` + Vercel secrets |

### Docker (local or any server)

```bash
cp .env.example .env.local
# fill in secrets, then:
docker compose -f deploy/docker-compose.yml up -d --build
# or
bash scripts/docker-run.sh
```

### GitHub Actions

Two separate manual workflows:

#### 1. Bump Version & Tag

**Actions → Bump Version & Tag → Run workflow**

1. Choose bump: `patch` | `minor` | `major`
2. Optionally enable **Trigger deploy pipeline** to chain into deploy
3. Updates `.github/workflows/release/release.properties`, `package.json`, and creates git tag (e.g. `v0.1.1`)

`.github/workflows/release/release.properties` fields:

| Key | Description |
|-----|-------------|
| `version.prefix` | Tag prefix (default `v`) — edit manually |
| `version.last` | Previous version |
| `version.current` | Current released version |
| `version.new` | Latest bumped version |
| `version.bump` | Last bump type (`patch`, `minor`, `major`) |
| `release.tag` | Full git tag (e.g. `v0.1.1`) |
| `release.date` | UTC date of last release |
| `release.ref` | Commit SHA of the release commit |

#### 2. Deploy Application

**Actions → Deploy Application → Run workflow**

1. Choose platform: `docker` | `fly` | `vps` | `vercel` | `skip`
2. Choose environment: `production` or `staging`
3. Reads version/tag from `.github/workflows/release/release.properties` for Docker image tags

Run **Bump Version & Tag** first when shipping a new version, then **Deploy Application** to deploy (or chain them in one run).

**VPS secrets:** `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `GHCR_READ_TOKEN`, optional `SSH_DEPLOY_PATH`

**Fly.io secrets:** `FLY_API_TOKEN`

**Vercel secrets:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
