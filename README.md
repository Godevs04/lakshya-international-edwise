# Nandhini Consultancy CRM

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

2. Fill in your MongoDB Atlas URI, Auth secret, Cloudinary, and SMTP credentials in `.env.local`.

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
| **Docker / VPS** | `docker compose up -d` or `bash scripts/docker-run.sh` |
| **GitHub Container Registry** | Push to `main` with `DEPLOY_PLATFORM=docker` (default) |
| **Fly.io** | `fly launch` then set `DEPLOY_PLATFORM=fly` + `FLY_API_TOKEN` secret |
| **Render** | Connect repo and use `render.yaml` blueprint |
| **Railway** | Connect repo — uses `Dockerfile` automatically |
| **VPS (SSH)** | Set `DEPLOY_PLATFORM=vps` + SSH/GHCR secrets (see below) |
| **Vercel** | Set `DEPLOY_PLATFORM=vercel` + Vercel secrets |

### Docker (local or any server)

```bash
cp .env.example .env.local
# fill in secrets, then:
docker compose up -d --build
# or
bash scripts/docker-run.sh
```

### GitHub Actions deploy

Repository variable `DEPLOY_PLATFORM`: `docker` | `fly` | `vps` | `vercel` | `skip`

Manual deploy: **Actions → Deploy → Run workflow** and pick a platform.

**VPS secrets:** `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `GHCR_READ_TOKEN`, optional `SSH_DEPLOY_PATH`

**Fly.io secrets:** `FLY_API_TOKEN`

**Vercel secrets:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
