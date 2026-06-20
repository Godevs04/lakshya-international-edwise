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
