# Nandhini Consultancy CRM — Full Project Analysis

**Analysis date:** June 21, 2026  
**Last updated:** June 21, 2026 (enhancements applied)  
**Version:** 0.1.0  
**Stack:** Next.js 16.2.9 · React 19 · Auth.js v5 (beta) · MongoDB/Mongoose 9 · Tailwind v4 · shadcn/ui · Sentry · PWA  
**Quality gate:** 48 tests passing · lint clean · production build passing

---

## Enhancements Applied (June 21, 2026)

| Item | Status |
|------|--------|
| Removed Sentry example routes | ✅ Done |
| Health endpoint — no env leak in production | ✅ Done |
| `ALLOW_PUBLIC_REGISTRATION=false` in `.env.example` | ✅ Done |
| Email verify tokens hashed (SHA-256) | ✅ Done |
| Permission-aware global search | ✅ Done |
| Page-level RBAC redirects | ✅ Done |
| In-app notifications (bell + mark read) | ✅ Done |
| PDF & Excel report export | ✅ Done |
| Audit logging for settings/user admin | ✅ Done |
| Optional Redis rate limiting (`REDIS_URL`) | ✅ Done |
| CSP enforced in production | ✅ Done |
| Global error → Sentry capture | ✅ Done |
| Corporate `notify` toasts app-wide | ✅ Done |
| PWA manifest uses company logo when set | ✅ Done |

**Still open:** E2E tests, deploy CD pipeline, dynamic DB roles, 2FA, bulk import, full PWA offline caching, Auth.js v5 stable release.

---

## Executive Summary

Nandhini Consultancy CRM is a **feature-complete, well-architected education/loan consultancy product** with a premium dashboard UI, full student/partner/application lifecycle, reports, analytics, global search, white-label settings, PII encryption, Cloudinary uploads, PWA support, and optional Sentry integration.

Since the earlier review (`site-review-recommendations.md`), significant progress has been made: **RBAC on read server actions**, **13 unit test files**, **GitHub Actions CI**, **Indian field validation**, **direct Cloudinary image uploads**, **PWA manifest/service worker**, and **env-based Sentry configuration**.

The app is **approaching production readiness** but still has a handful of **security and ops items** that should be addressed before a public launch — especially removing Sentry test routes, tightening registration defaults, and scaling rate limiting beyond in-memory storage.

**Recommended focus order:** production safety (Sentry examples, registration, health endpoint) → security hardening (CSP, search RBAC, token hashing) → feature polish (notifications, PDF/Excel export) → test depth (actions, E2E).

---

## Current State — What Is Implemented

### Core CRM Modules

| Module | Status | Key paths |
|--------|--------|-----------|
| Dashboard overview | ✅ Live metrics, charts, follow-ups, activity | `app/(dashboard)/dashboard/overview/`, `lib/actions/dashboard.actions.ts` |
| Students CRM | ✅ CRUD, notes, documents, bulk ops, lifecycle status | `lib/actions/student.actions.ts`, `components/forms/student-form.tsx` |
| Partners | ✅ CRUD, commission, bank details, analytics | `lib/actions/partner.actions.ts` |
| Applications | ✅ Table + Kanban (dnd-kit), status pipeline | `lib/actions/application.actions.ts`, `components/dashboard/application-kanban.tsx` |
| Reports | ✅ Daily/Weekly/Monthly/Yearly presets, CSV export | `lib/actions/report.actions.ts` |
| Analytics | ✅ Funnel, trends, demographics, heat map | `lib/actions/analytics.actions.ts` |
| Global search | ✅ Cmd+K command palette | `lib/actions/search.actions.ts`, `components/dashboard/global-search.tsx` |
| Settings / white-label | ✅ Company info, logo upload, modules, users | `lib/actions/settings.actions.ts`, `components/dashboard/settings-view.tsx` |
| Audit log | ✅ Filterable audit viewer | `app/(dashboard)/dashboard/audit/`, `lib/actions/audit.actions.ts` |
| Activity logging | ✅ Writes on student/partner/application mutations | `lib/services/activity.service.ts` |

### Auth & Onboarding

| Feature | Status | Notes |
|---------|--------|-------|
| Login / logout | ✅ | JWT sessions via Auth.js v5 |
| Register + OTP email | ✅ | Pending approval queue for new staff |
| Forgot / reset password | ✅ | Reset tokens SHA-256 hashed |
| Admin approve/reject users | ✅ | Settings → Users |
| Public registration toggle | ✅ | `ALLOW_PUBLIC_REGISTRATION` env var |
| Rate limiting (auth) | ✅ | In-memory via `rate-limiter-flexible` |

### Security & Data Protection

| Feature | Status | Notes |
|---------|--------|-------|
| RBAC (5 roles) | ✅ | super_admin → viewer |
| Action-layer read RBAC | ✅ | All primary CRM read actions guarded |
| PII encryption | ✅ | AES-256-GCM for Aadhaar, PAN, bank account |
| Masked display / full edit values | ✅ | Detail views masked; edit forms show decrypted values |
| Indian field validation | ✅ | Aadhaar (12 digits), PAN, phone, pincode, IFSC |
| Cloudinary signed uploads | ✅ | Folder-scoped RBAC, server URL validation |
| Security headers | ✅ | HSTS, X-Frame-Options, nosniff, Permissions-Policy |
| CSP | ⚠️ Report-only | Not enforced; allows unsafe-inline/eval |

### UX & Platform

| Feature | Status | Notes |
|---------|--------|-------|
| Dark / light / system theme | ✅ | next-themes |
| Corporate toast notifications | ✅ | State-colored Sonner toasts via `lib/toast.ts` |
| Direct image upload fields | ✅ | Student photo, partner logo, company logo |
| Required vs optional form sections | ✅ | `FormSection` component |
| PWA | ✅ Minimal | Manifest, icons, SW, offline fallback page |
| Sentry (optional) | ✅ | Client/server/edge, tunnel route, env-based DSN |
| Health check API | ✅ | `/api/health` — MongoDB + env validation |

### DevOps

| Feature | Status | Notes |
|---------|--------|-------|
| CI pipeline | ✅ | Lint → test → build on push/PR |
| Seed script | ✅ | Roles, settings, super admin |
| Env validation | ✅ | `lib/config/validate-env.ts`, `instrumentation.ts` |
| Deploy workflow | ❌ | No CD, staging, or env promotion |

---

## Recent Improvements (Since Prior Review)

These items were flagged in `site-review-recommendations.md` and have since been addressed:

1. **Read-path RBAC** — `requirePermission()` now on student, partner, application, settings, audit, report, analytics, upload, and dashboard read actions.
2. **Automated tests** — 13 Vitest files, 48 tests covering permissions, schemas, PII, encryption helpers, Indian fields, Sentry env, upload validation, etc.
3. **CI** — `.github/workflows/ci.yml` runs lint, test, and build on Node 20.
4. **Cloudinary uploads** — Replaced manual URL fields with `ImageUploadField` + signed upload actions.
5. **Indian validation** — Dedicated validators and tests in `lib/validations/indian-fields.ts`.
6. **PWA** — Manifest, service worker, offline page, production-only registration.
7. **Sentry secrets** — DSN and build plugin credentials moved to `.env.local`; no hardcoded values.
8. **Theme settings tab removed** — Was not wired to the UI; dead configuration removed.
9. **Toast UX** — Corporate styling with state-based colors; hover/click color bleed fixed.

---

## Blockers & Show-Stoppers

These should be resolved **before production launch**.

| # | Issue | Risk | Action | Effort |
|---|-------|------|--------|--------|
| 1 | **Sentry example routes are public** | Anyone can trigger intentional errors | Remove or gate `app/sentry-example-page/` and `app/api/sentry-example-api/` | S |
| 2 | **`ALLOW_PUBLIC_REGISTRATION=true` in `.env.example`** | Open signup assigns `staff` role pending approval — risky if copied to prod | Set default to `false` in example; document clearly; verify prod `.env` | S |
| 3 | **In-memory rate limiting** | Resets on restart; not shared across instances | Migrate to Redis-backed limiter for multi-instance/Vercel deploys | M |
| 4 | **CSP is report-only** | XSS protection not enforced | Tighten CSP, remove `unsafe-eval`, switch to enforced policy | M |
| 5 | **Auth.js v5 beta** | Pre-release dependency; breaking changes possible | Monitor releases; pin version; test upgrades in staging | Ongoing |
| 6 | **Health endpoint leaks env info** | `/api/health` returns `missingEnv` array in production | Return generic unhealthy status; log details server-side only | S |
| 7 | **SMTP misconfiguration** | Register/OTP/reset flows fail silently or partially | Add startup warning; health check SMTP probe; document required vars | S |

---

## Security Gaps (Non-Blocking but Important)

### Route-Level RBAC

- **Action layer is strong** — mutations and reads enforce permissions in server actions.
- **Page layer is weak** — most dashboard pages only check `requireModuleEnabled()` (module toggle), not specific permissions. A user who knows URLs could reach pages; actions would still throw, but UX shows errors instead of redirects.
- **`canAccessRoute()` is dead code** — defined in `lib/auth/permissions.ts` but never used. Wire it into layout/page guards or remove.
- **Audit page** — no page-level redirect; unauthorized users see thrown auth errors via `runLoggedQuery`.

### Global Search RBAC Leak

`globalSearchAction` authenticates the user but queries **all entity types** first, then filters results post-query by permission. A user without partner access still triggers partner DB queries (results are filtered out, but data is accessed unnecessarily).

**Fix:** Permission-aware search — only query collections the user can read.

### Token Storage Inconsistency

| Token | Storage |
|-------|---------|
| Password reset | ✅ SHA-256 hashed via `hashToken()` |
| OTP | ✅ bcrypt hashed |
| Email verify | ❌ Plaintext in DB (`verifyEmailAction`) |

Hash verify tokens the same way as reset tokens.

### Rate Limiting Scope

Rate limits apply **only to auth flows** (login, register, OTP, forgot/reset). No limits on CRM server actions, uploads, search, or general API routes.

### Permissions Source of Truth

- Runtime permissions come from hardcoded `ROLE_PERMISSIONS` in `lib/auth/authorize.ts`.
- `Role` model is seeded in MongoDB but **not authoritative at auth time**.
- Settings UI shows roles; changing DB roles has no effect until code constants are updated.

### Other

- **`/api/health` information disclosure** — exposes which env vars are missing.
- **Session permissions baked at login** — role changes require re-login to take effect.
- **`global-error.tsx`** — logs locally only; no Sentry capture on unhandled client errors.

---

## Attractive Features & Upgrades to Introduce

Prioritized by impact and effort (S = small, M = medium, L = large).

### P0 — Production Safety (Do First)

| Feature | Why | Effort |
|---------|-----|--------|
| Remove/gate Sentry example pages | Prevent public error injection | S |
| Fix health endpoint response | Stop env var enumeration | S |
| Set `ALLOW_PUBLIC_REGISTRATION=false` as prod default | Prevent unauthorized signups | S |

### P1 — High-Value Product Features

| Feature | Why | Effort |
|---------|-----|--------|
| **In-app notifications** | `createNotification` service exists; topbar bell is a placeholder ("No new notifications") | M |
| **PDF & Excel export** | `jspdf` and `xlsx` already in dependencies but unused; README mentions export — only CSV works today | M |
| **Permission-aware global search** | Closes search RBAC gap; cleaner and safer | S |
| **Page-level permission guards** | Defense in depth; redirect unauthorized users instead of error pages | M |
| **Hash email verify tokens** | Consistent token security posture | S |
| **Redis-backed rate limiting** | Required for scaled/multi-instance deployment | M |
| **Audit logging for settings/admin actions** | User approve/reject, role changes, settings mutations skip `logActivity` | S |

### P2 — Differentiators & Enterprise Readiness

| Feature | Why | Effort |
|---------|-----|--------|
| **Bulk student import (CSV/XLSX)** | Common CRM onboarding need for existing client lists | M |
| **Follow-up reminder emails/push** | Follow-ups shown on dashboard but no proactive alerts | M |
| **Dynamic roles from DB** | Settings roles become editable without code deploys | L |
| **2FA / TOTP for admin accounts** | Enterprise security expectation | L |
| **Role management UI** | `ROLES_MANAGE` permission defined but no management UI | M |
| **Enforced CSP** | Move from report-only to blocking policy | M |
| **Company logo in PWA manifest** | Brand consistency on home-screen install | S |

### P3 — Polish & Scale

| Feature | Why | Effort |
|---------|-----|--------|
| **Full PWA offline caching** | Current SW only caches `/offline` page — not a usable offline CRM | L |
| **E2E tests (Playwright)** | No browser/integration coverage; auth and Kanban flows untested end-to-end | L |
| **Server action integration tests** | 48 unit tests cover utilities; zero action/service/MongoDB tests | L |
| **Deploy workflow (CD)** | CI builds only; no automated staging/production promotion | M |
| **Sentry source maps in CI** | Better stack traces when `SENTRY_AUTH_TOKEN` is set | S |
| **MongoDB backup/migration tooling** | Seed only; no documented backup or schema migration strategy | M |
| **Migrate remaining raw `toast()` calls** | Some components still import from `"sonner"` directly instead of `@/lib/toast` | S |
| **Multi-tenant readiness** | Dashboard cache (`unstable_cache`) is org-wide, not user/tenant scoped | L |

---

## Tech Debt & Known Issues

### Test Coverage Gaps

**Covered (13 files, 48 tests):**

- Permissions, Zod schemas, PII masking, sanitization, token hashing
- Indian field validators, Sentry env config, upload URL validation
- Action utils, build phase, metrics trend, email templates

**Not covered:**

- All `lib/actions/*.ts` server actions
- Auth flows (login, OTP, register, reset)
- MongoDB services and aggregations
- RBAC on pages, Kanban drag-and-drop, report generation
- Encryption round-trip, rate limiting behavior

### Dead / Unused Code

| Item | Location |
|------|----------|
| `canAccessRoute()` | `lib/auth/permissions.ts` — never called |
| `createNotification()` | `lib/services/notification.service.ts` — never invoked |
| `jspdf`, `xlsx` | In `package.json` — zero imports in codebase |
| `ROLES_MANAGE` permission | Defined but no UI |
| `verifyEmailAction` | Appears legacy alongside OTP verify flow |

### Architecture Notes

- **`proxy.ts`** is NextAuth session middleware — not a general proxy; no rate limiting despite the name.
- **No `middleware.ts`** — Next.js 16 uses `proxy.ts` for auth session checks on `/dashboard/*`.
- **Dashboard aggregations cached 60s** via `unstable_cache` — fine for single-org; revisit for multi-tenant.
- **`runLoggedQuery` auth errors throw** — surfaces as page errors rather than redirects for unauthorized access.
- **Internal planning docs** — `site-review-recommendations.md` is partially outdated (RBAC reads, tests, CI now exist).

### Lint & Code Quality

- ESLint 9 + `eslint-config-next` 16.2.9
- `no-console: error` globally (except `lib/logger.ts`)
- No `TODO` / `FIXME` / `HACK` comments found in application source

---

## Ops & Deployment Checklist

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection |
| `AUTH_SECRET` | Yes | JWT signing (min 32 chars) |
| `AUTH_URL` | Yes | Auth callback base URL |
| `APP_ENCRYPTION_KEY` | Yes (prod) | 64-char hex AES key for PII |
| `CLOUDINARY_*` | Yes | Image/document uploads |
| `SMTP_*` | Yes | OTP, reset, approval emails |
| `SEED_ADMIN_*` | Seed only | Initial super admin credentials |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Optional | Error tracking |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Optional | Source map upload at build |
| `ALLOW_PUBLIC_REGISTRATION` | Optional | Default: allowed in dev, should be `false` in prod |

Reference: `.env.example`, `lib/config/validate-env.ts`, `lib/config/sentry-env.ts`

### Pre-Launch Checklist

- [ ] Set `ALLOW_PUBLIC_REGISTRATION=false` in production
- [ ] Remove or protect Sentry example routes
- [ ] Verify all SMTP, MongoDB, Cloudinary, encryption key configured
- [ ] Run `npm run seed` once for roles + super admin
- [ ] Confirm CSP policy (report-only → enforced when ready)
- [ ] Set up Redis for rate limiting if multi-instance
- [ ] Configure Sentry DSN and verify error capture
- [ ] Test PWA install on mobile (production build only)
- [ ] Review `/api/health` response in production
- [ ] Document backup strategy for MongoDB Atlas

### CI Pipeline (Current)

```
push/PR → main|master
  ├── npm ci
  ├── npm run lint
  ├── npm run test      (48 tests)
  └── npm run build     (with CI env stubs)
```

Missing: deploy job, Sentry upload in CI, MongoDB service for integration tests, security scanning.

---

## Scorecard

| Area | Rating | Notes |
|------|--------|-------|
| Core CRM features | ⭐⭐⭐⭐⭐ | Students, partners, applications, reports, analytics — complete |
| UI/UX polish | ⭐⭐⭐⭐ | Premium dashboard, toasts, forms, Kanban; notifications stub |
| Action-layer RBAC | ⭐⭐⭐⭐ | Reads and writes largely protected |
| Route/edge RBAC | ⭐⭐ | Module guards only; permission redirects missing |
| Auth hardening | ⭐⭐⭐ | bcrypt + hashed reset tokens; beta next-auth; in-memory rate limits |
| PII / encryption | ⭐⭐⭐⭐ | AES-256-GCM, masked display; verify token gap |
| File uploads | ⭐⭐⭐⭐ | Cloudinary signed, folder RBAC, direct upload UI |
| Test coverage | ⭐⭐ | Good utility coverage; no action/E2E tests |
| CI/CD | ⭐⭐⭐ | Quality gate exists; no deploy pipeline |
| Production config | ⭐⭐ | Registration default, Sentry examples, CSP, rate limit scaling |
| PWA | ⭐⭐ | Installable; minimal offline support |
| Observability | ⭐⭐⭐ | Sentry optional; structured logging; health endpoint |

---

## Suggested Roadmap

### Phase 1 — Production Hardening (1–2 weeks)

1. Remove Sentry example pages
2. Fix health endpoint + registration defaults
3. Hash email verify tokens
4. Permission-aware search
5. Page-level permission redirects for sensitive routes

### Phase 2 — Feature Completion (2–4 weeks)

1. Wire in-app notifications (bell dropdown + `createNotification` calls on key events)
2. PDF/Excel export for reports
3. Audit logging for settings/user admin actions
4. Redis rate limiting
5. Enforced CSP

### Phase 3 — Scale & Quality (4+ weeks)

1. Server action + integration tests
2. Playwright E2E smoke tests
3. Deploy workflow (staging → production)
4. Bulk CSV/XLSX student import
5. Follow-up reminder notifications

### Phase 4 — Enterprise (Future)

1. Dynamic roles from DB
2. 2FA for admin accounts
3. Multi-tenant architecture
4. Full PWA offline support

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `scripts/Notes/site-review-recommendations.md` | Earlier review (June 2026) — partially superseded by this analysis |
| `scripts/Notes/premium_saas_crm_e93b60a7.plan.md` | Original feature plan and phase breakdown |
| `.env.example` | Environment variable reference |
| `README.md` | Getting started and feature overview |

---

*Generated from full codebase analysis including action-layer RBAC audit, test/CI verification, security review, and dependency scan.*
