# Project Review — Bugs, Issues & Suggestions

**Date:** June 29, 2026  
**Scope:** Full repo review (CRM + marketing site + deploy/ops)  
**Related:** Older deep-dive in `scripts/Notes/site-review-recommendations.md` — many items there are now fixed; this file reflects **current** state.

---

## Executive summary

The project is in good shape: RBAC on reads, rate limiting, CSP, health checks, Sentry, Vitest (~197 tests), CI, and premium marketing pages are largely in place. Remaining work is mostly **security hygiene**, **content/production polish**, and **ops migration** after the recent root cleanup.

---

## Critical — fix immediately

### 1. Production MongoDB credentials were committed to Git

A root file named `Untitled` contained a live `MONGODB_URI` (Atlas user + password). It was deleted during root cleanup, but **Git history still contains it** (commit `1df4357`).

**Action:**

1. Rotate the Atlas database user password (or delete and recreate the user).
2. Audit Atlas access logs for unexpected connections.
3. Consider `git filter-repo` or BFG to purge the secret from history if the repo is or was public.
4. Add a pre-commit secret scan (e.g. `gitleaks`, GitHub secret scanning).

---

### 2. `.env.example` is gitignored

`.gitignore` lists `.env.example`, so new developers and CI cannot rely on a committed env template. The file exists locally but will not ship with clones.

**Fix:** Remove `.env.example` from `.gitignore` and commit it. Also add missing keys documented below (`ALLOW_PUBLIC_REGISTRATION`, `CRON_SECRET`, `REDIS_URL`, Sentry vars).

---

### 3. Cron endpoints open in dev when `CRON_SECRET` is unset

`app/api/cron/follow-up-reminders/route.ts` and `task-reminders/route.ts` allow unauthenticated access when `CRON_SECRET` is missing and `NODE_ENV !== "production"`. Fine for local dev; ensure **production always sets `CRON_SECRET`**.

---

## High priority

### 4. Partner bank details stored in plaintext

`models/Partner.ts` stores `bankDetails.accountNumber` and `ifsc` as plain strings. Student Aadhaar/PAN are encrypted; partner payout data should follow the same pattern (`lib/utils/encryption.ts`).

---

### 5. Rate limiting falls back to in-memory store

`lib/rate-limit.ts` uses Redis when `REDIS_URL` is set; otherwise **per-process memory**. On multi-instance deploys (Fly, Render, multiple VPS containers), limits are not shared — attackers can bypass by hitting different instances.

**Fix:** Require `REDIS_URL` in production (docker-compose already includes Redis for local prod smoke tests).

---

### 6. Deploy path migration (after root cleanup)

Docker and platform files moved to `deploy/`:

| Old path | New path |
|----------|----------|
| `Dockerfile` | `deploy/Dockerfile` |
| `docker-compose.yml` | `deploy/docker-compose.yml` |
| `docker-compose.prod.yml` | `deploy/docker-compose.prod.yml` |
| `render.yaml` | `deploy/render.yaml` |

`fly.toml` stays at **repo root** and points to `deploy/Dockerfile`.

**Action for live environments:**

- **Render:** Update blueprint to `deploy/render.yaml` (auto-detect no longer finds root `render.yaml`).
- **VPS SSH deploy:** Use `docker compose -f deploy/docker-compose.prod.yml …`.
- **Railway / custom Docker:** Set Dockerfile path to `deploy/Dockerfile`, build context = repo root.

---

## Medium priority — bugs & UX

### 7. Google Reviews section shows placeholder copy on the live site

`components/marketing/sections/google-reviews.tsx` renders:

> "Google Reviews integration placeholder - connect your Google Business profile"

Visitors see this text. Either integrate Google Business / Places API, embed a widget, or remove the line and use only curated static reviews from `lib/constants/marketing/google-reviews.ts`.

---

### 8. Marketing media still mostly placeholders

- Hero student mosaic: SVG placeholders in `public/marketing/students/`
- Blog covers: default SVG fallback in `blog-card.tsx`
- Partner marquee: university **names only** in `lib/constants/marketing/partners.ts` (no logos)

Replace with real Cloudinary assets when client provides photos/logos.

---

### 9. Dashboard dark mode — partial hardcoded light styles

Menu permissions sheet was fixed to use semantic tokens (`bg-card`, `text-foreground`, etc.). Some dashboard components still use explicit light glass styles (`bg-white/60`, `bg-white/90`) that may look off in dark mode:

- `components/dashboard/application-kanban.tsx`
- `components/dashboard/dashboard-hero.tsx`
- `components/dashboard/student-stage-tabs.tsx`

Audit remaining `bg-white` / `text-slate-*` usage under `components/dashboard/`.

---

### 10. `Role` model vs static `ROLE_PERMISSIONS` drift

Roles are seeded in `scripts/seed.ts` / `models/Role.ts`, but runtime authorization uses `lib/constants/permissions.ts` (`ROLE_PERMISSIONS`). DB role documents can diverge from code without anyone noticing.

**Options:** Load permissions from DB at login, or stop seeding editable Role docs and treat permissions as code-only.

---

### 11. `next-auth` still on beta

`package.json`: `"next-auth": "^5.0.0-beta.31"`. Pin to stable Auth.js v5 before long-term production reliance, and re-test login/session flows after upgrade.

---

### 12. CSP allows `'unsafe-inline'` for scripts and styles

Required for many Next.js setups, but weakens XSS protection. Longer term: tighten CSP with nonces/hashes once inline script inventory is known. Currently enforced in production (`next.config.ts`); report-only in dev.

---

## Low priority / polish

| Item | Location | Suggestion |
|------|----------|------------|
| Test fixture bloat | `assets/banners/test/` (~1.1 MB, duplicate `(1)` / `(2)` files) | Keep only `student-import-template.csv` (+ minimal set for manual QA); gitignore or move large PDFs/XLSX out of repo |
| `.env.example` incomplete | `.env.example` | Add `ALLOW_PUBLIC_REGISTRATION`, `CRON_SECRET`, `REDIS_URL`, `SENTRY_DSN`, `WEBSITE_ENQUIRY_NOTIFY_EMAIL` |
| E2E tests optional in CI | `.github/workflows/ci.yml` | Gated on `ENABLE_E2E_TESTS`; enable for main branch when stable |
| Duplicate docs folders | `scripts/Notes/` vs `scripts/webNotes/` | Consolidate or link from README |
| Student detail page | `app/(dashboard)/dashboard/students/[id]/page.tsx` | Imports `serializeLoanApplications` from service layer directly; page is permission-guarded — acceptable, but prefer action wrapper for consistency |
| `proxy.ts` | Root | Auth session only; route RBAC is in `lib/auth/page-access.ts` per page — ensure **API routes** stay separately protected (cron routes OK) |
| Build artifact at root | `tsconfig.tsbuildinfo` | Already in `.gitignore` via `*.tsbuildinfo`; safe to delete locally |

---

## Recently fixed (reference — no action needed)

These came up during recent work and are **resolved**:

| Issue | Fix |
|-------|-----|
| Website leads invisible in CRM (no assignee) | `lib/services/student-visibility.service.ts` — website inbound bypass; lead source shown in admissions UI |
| Menu permissions matrix bright white on dark dashboard | Semantic theme tokens in `user-menu-permissions.tsx`, `user-permissions-sheet.tsx`, `settings-view.tsx` |
| Next.js image quality warning (`quality=100`) | `images.qualities: [100, 75]` in `next.config.ts` |
| Sentry tunnel `ECONNRESET` in local dev | `tunnelRoute` only in production |
| Root directory clutter | `deploy/`, `assets/banners/`; removed stray `Untitled` |
| Read-path RBAC gap (older review) | Actions now call `requirePermission`; pages use `requirePagePermission` |
| RegExp / ReDoS in search | `toSafeRegExp` in search and student filters |
| Password reset token plaintext | Hashed via `hashToken()` before DB storage |
| `super_admin` via admin user create | Blocked in `settings.actions.ts` |
| Public registration in production | `ALLOW_PUBLIC_REGISTRATION` defaults false; register route blocked |
| No tests / CI / health / Sentry | Vitest suite, GitHub Actions, `/api/health`, optional Sentry |

---

## Suggested roadmap

### Week 1 — Security & ops

1. Rotate MongoDB credentials; purge secret from Git history if needed  
2. Fix `.gitignore` and commit complete `.env.example`  
3. Confirm production `CRON_SECRET` + `REDIS_URL`  
4. Update Render/VPS deploy paths to `deploy/*`

### Week 2 — Data & UX

1. Encrypt partner bank fields  
2. Remove Google Reviews placeholder line or wire real integration  
3. Dashboard dark-mode audit for remaining hardcoded light surfaces  
4. Replace marketing placeholders with client assets

### Ongoing

1. Upgrade `next-auth` to stable v5  
2. Tighten CSP  
3. Resolve Role model vs static permissions  
4. Prune `assets/banners/test` to essentials only

---

## Quick health check commands

```bash
npm run lint
npm test
npm run build
docker compose -f deploy/docker-compose.yml up -d --build   # optional local prod smoke
bash scripts/backup-mongodb.sh                               # requires mongodump + MONGODB_URI
```

---

*Generated from codebase review and recent implementation sessions. Update this file when issues are fixed or new ones are found.*
