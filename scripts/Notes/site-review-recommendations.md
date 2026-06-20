# Nandhini Consultancy CRM — Site Review & Recommendations

**Review date:** June 21, 2026  
**Stack:** Next.js 16 (App Router) · Auth.js v5 · MongoDB/Mongoose · Tailwind v4 · shadcn/ui  
**Scope:** Full codebase scan — architecture, security, data layer, UI, ops, and production readiness

---

## Executive Summary

The CRM is **well-structured and feature-rich** for an education/loan consultancy product. The layered design (`app` → `actions` → `services` → `models`), OTP + admin approval onboarding, centralized logger, Zod validation, and polished dashboard UI are strong foundations.

However, the app is **not production-ready** until a few security and ops gaps are closed. The highest-risk issue is that **read server actions do not enforce RBAC** — any logged-in user can fetch students, partners, applications, and global search results, even if the UI hides those pages. Mutations are mostly guarded; reads are not.

**Recommended focus order:** security (RBAC + rate limits + token hashing) → tests/CI → performance → polish.

---

## What Is Working Well

| Area | Notes |
|------|-------|
| **Architecture** | Clear separation: route groups `(auth)` / `(dashboard)`, server actions, services, Mongoose models, shared types |
| **Auth onboarding** | Register → OTP email → pending queue → admin approval → active login is implemented end-to-end |
| **Mutation RBAC** | Most write actions call `requirePermission()` — settings, students, partners, applications, reports |
| **Validation** | Zod schemas in `lib/validations/schemas.ts`; sanitization via `lib/utils/sanitize.ts` |
| **Sensitive data** | Aadhaar/PAN encrypted at write time (`lib/utils/encryption.ts`) |
| **Logging** | Central `lib/logger.ts`, ESLint `no-console`, action wrappers in `lib/action-utils.ts`, `instrumentation.ts` |
| **UI/UX** | Premium dashboard, loading/error boundaries per route, module-aware sidebar, responsive layout |
| **Security headers** | HSTS, X-Frame-Options, nosniff, Permissions-Policy in `next.config.ts` |
| **Database** | Connection singleton, useful indexes on Student/Partner/Application, status enums centralized |

---

## Critical Issues (Fix Before Production)

### 1. Read paths bypass RBAC

**Problem:** Query server actions and some services do not call `getSessionUser()` or `requirePermission()`. Any authenticated session (including `viewer` or mis-assigned roles) can invoke these and receive full CRM data.

**Affected files:**

- `lib/actions/student.actions.ts` — `getStudents`, `getStudentById`
- `lib/actions/partner.actions.ts` — `getPartners`, `getPartnerById`, `getPartnerStudents`, `getPartnersList`, `getPartnerAnalytics`
- `lib/actions/application.actions.ts` — `getApplications`
- `lib/actions/search.actions.ts` → `lib/services/search.service.ts`
- `app/(dashboard)/dashboard/overview/page.tsx` — calls `lib/services/dashboard.service.ts` directly (no action layer)
- `app/(dashboard)/dashboard/analytics/page.tsx` — calls `lib/services/analytics.service.ts` directly

**Recommendation:**

```typescript
// Pattern for every read action
const user = await getSessionUser();
requirePermission(user, PERMISSIONS.STUDENTS_READ);
```

Add a shared helper, e.g. `withReadPermission(permission, handler)` in `lib/action-utils.ts`, and route **all** page data through guarded actions — never call services directly from RSC pages.

---

### 2. No automated tests or CI

**Problem:** Zero `*.test.ts` / `*.spec.ts` files. No GitHub Actions or other CI workflow. Regressions in auth, permissions, or OTP flow will not be caught.

**Recommendation:**

- Add **Vitest** for unit tests: permissions, Zod schemas, encryption utils, auth action edge cases
- Add **Playwright** (optional) for register → OTP → pending → login smoke test
- GitHub Actions: `npm run lint` → `npm run build` → `npm test`

**Priority test targets:**

- `lib/auth/permissions.ts`
- `lib/actions/auth.actions.ts` (OTP, pending, login validation)
- `lib/actions/settings.actions.ts` (approve/reject user)
- `lib/validations/schemas.ts`

---

### 3. Privilege escalation via user creation

**Problem:** `createUserAction` in `lib/actions/settings.actions.ts` accepts any `role` from FormData, including `super_admin`. The approval flow correctly blocks super_admin assignment, but admin-created users do not.

**Recommendation:**

- Server-side: reject `role === "super_admin"` (and optionally `admin` unless creator is super_admin)
- UI: filter role dropdown in `components/dashboard/settings-view.tsx` to match server rules

---

## High Priority

### 4. Rate limiting not implemented

**Problem:** `rate-limiter-flexible` is in `package.json` but unused. Auth endpoints (login, register, OTP, forgot-password) are vulnerable to brute force and email spam.

**Recommendation:** Rate-limit by IP + email in `lib/actions/auth.actions.ts` or at the edge in `proxy.ts`:

| Endpoint | Suggested limit |
|----------|-----------------|
| Login | 5 attempts / 15 min per IP |
| OTP verify | 5 attempts / 10 min per email |
| Register | 3 / hour per IP |
| Resend OTP | 3 / 10 min per email |
| Forgot password | 3 / hour per email |

---

### 5. Password reset tokens stored in plaintext

**Problem:** `resetToken` is saved as a raw hex string in MongoDB (`lib/actions/auth.actions.ts`, `models/User.ts`). A DB leak exposes usable reset links.

**Recommendation:** Store `SHA-256(resetToken)` in DB; compare hash on reset. Same pattern as `emailOtpHash`.

---

### 6. RegExp injection / ReDoS in search

**Problem:** User search input is passed directly to `new RegExp(trimmed, "i")` in:

- `lib/services/search.service.ts`
- `lib/actions/student.actions.ts`
- `lib/actions/partner.actions.ts`

Malicious input like `(a+)+$` can cause CPU spikes. Special regex chars break intended searches.

**Recommendation:**

- Escape regex metacharacters before building RegExp, **or**
- Use MongoDB `$text` search (Student model already has a text index), **or**
- Use `$regex` with fixed prefix-only matching for phone/studentId fields

---

### 7. `.env.example` is gitignored

**Problem:** `.gitignore` line 34 ignores `.env*`, so `.env.example` is not committed. README instructs `cp .env.example .env.local`, which fails on a fresh clone.

**Recommendation:** Change `.gitignore` to:

```gitignore
.env
.env.local
.env.*.local
!.env.example
```

Commit `.env.example` with placeholders only (no real secrets).

---

### 8. Unbounded data loads

**Problem:**

- `getApplications()` loads **all** applications with populates — no pagination
- `globalSearch` loads applications with `.find().limit(limit)` but filters in JavaScript after full populate
- Overview page fires ~9 parallel DB/service calls on every load

**Recommendation:**

- Paginate applications (same pattern as students/partners)
- Push search filters into MongoDB `$match` clauses
- Cache dashboard metrics with `unstable_cache` (e.g. 60s TTL) or a single aggregation pipeline

---

### 9. JWT permissions frozen at login

**Problem:** Role/permissions are embedded in JWT at sign-in (`lib/auth/auth.config.ts`). If an admin changes a user's role via Settings, the user keeps old permissions until re-login.

**Recommendation:**

- Re-fetch permissions from DB in a server helper on sensitive actions, **or**
- Invalidate session / force re-auth when `updateUserRoleAction` runs on that user, **or**
- Shorten JWT `maxAge` and refresh permissions in `jwt` callback periodically

---

## Medium Priority

### 10. Session settings not wired

- `rememberMe` is saved to DB but JWT `maxAge` is always 24h (`lib/auth/auth.config.ts`)
- `sessionExpiryHours` in Settings model is never applied to Auth session

**Fix:** Read settings in `jwt` / `session` callbacks and set `maxAge` from `rememberMe` + org settings.

---

### 11. Module disable is UI-only

**Problem:** Disabling modules in Settings hides sidebar links (`components/dashboard/sidebar.tsx`) but dashboard routes remain reachable by URL.

**Fix:** Server-side check on each module page:

```typescript
const config = await getAppConfig();
if (!config.modules.students) redirect("/dashboard");
```

---

### 12. Permission-aware UI missing

**Problem:** Create/edit/delete buttons are visible to all roles that can reach the page, even when mutations would fail.

**Fix:** Pass `session.user.permissions` to client components; hide actions with `hasPermission()`. Consider a small `usePermissions()` hook.

---

### 13. Fake metric trends on overview

**Problem:** `app/(dashboard)/dashboard/overview/page.tsx` hardcodes trends like `"↑ 24%"`, `"↑ 41%"` — misleading in production.

**Fix:** Remove trend props until real period-over-period calculation exists in `lib/services/dashboard.service.ts`.

---

### 14. Encrypted fields not decrypted for authorized views

**Problem:** Aadhaar/PAN are encrypted on save but `decrypt()` / `maskSensitive()` in `lib/utils/encryption.ts` are unused. Edit forms may show empty or ciphertext.

**Fix:** Decrypt server-side for users with `STUDENTS_READ`; display masked values (e.g. `XXXX-XXXX-1234`).

---

### 15. Partner bank details unencrypted

**Problem:** Partner bank account numbers stored in plaintext (`models/Partner.ts`). Same risk class as student PII.

**Fix:** Encrypt sensitive bank fields or restrict to admin-only detail view with masking.

---

### 16. Document upload accepts arbitrary URLs

**Problem:** `addStudentDocumentAction` trusts client-supplied `url` / `publicId` without validating Cloudinary origin.

**Fix:** Use signed upload flow via `lib/services/upload.service.ts`; validate `publicId` belongs to your Cloudinary folder on save.

---

### 17. Open self-registration in production

**Problem:** Anyone can register at `/register`. By design for onboarding, but risky for a private CRM.

**Fix:** Add env flag `ALLOW_PUBLIC_REGISTRATION=false` for production; hide register link and block `registerAction`.

---

### 18. No Content-Security-Policy

**Problem:** Security headers exist but no CSP in `next.config.ts`.

**Fix:** Add CSP (start with `Content-Security-Policy-Report-Only`), allow Cloudinary + self.

---

### 19. No health check or monitoring

**Problem:** No `/api/health` endpoint; logger writes to stdout only; no Sentry/Datadog integration.

**Fix:**

- Add `GET /api/health` → MongoDB ping + version
- Integrate Sentry in `instrumentation.ts` for production errors
- Structured JSON logs in production (`lib/logger.ts`)

---

### 20. `Role` model vs static permissions drift

**Problem:** `models/Role.ts` is seeded in `scripts/seed.ts` but runtime auth uses only `ROLE_PERMISSIONS` in `lib/constants/permissions.ts`.

**Fix:** Either load permissions from DB at login or remove unused Role collection to avoid confusion.

---

### 21. `canAccessRoute()` is dead code

**Problem:** Defined in `lib/auth/permissions.ts` but never called from `proxy.ts` or layouts.

**Fix:** Wire into middleware or delete.

---

### 22. `createUserAction` lacks Zod validation

**Problem:** Admin user creation uses raw FormData casts; no password strength rules (unlike `registerSchema`).

**Fix:** Reuse or extend registration schema for admin-created users.

---

## Low Priority

| Item | Location | Suggestion |
|------|----------|------------|
| `upload.service.ts` unused | `lib/services/upload.service.ts` | Wire to student/partner forms or remove |
| Double bcrypt on login | `login/page.tsx` + `authorize.ts` | Acceptable for UX; optional to remove duplicate `validateLoginAction` |
| Email HTML injection | `lib/services/email.service.ts` | Escape user `name` in HTML templates |
| Error messages in UI | `page-error.tsx`, `global-error.tsx` | Generic message in production; log details only |
| `<img>` vs `next/image` | `components/dashboard/sidebar.tsx` | Use `next/image` for logos where possible |
| Auth.js beta pin | `package.json` `next-auth@beta` | Pin stable v5 before production |
| `AUDIT_READ` permission unused | `permissions.ts`, `AuditLog` model | Build audit viewer or remove permission |
| Dev-only Mongoose cache bust | `models/User.ts` | Document for team (expected HMR behavior) |
| Planning doc in repo | `scripts/Notes/*.plan.md` | Keep in Notes or move to wiki |

---

## Suggested Implementation Roadmap

### Phase 1 — Security (1–2 weeks)

1. Add RBAC to all read actions and remove direct service calls from pages
2. Block `super_admin` in `createUserAction`
3. Hash password reset tokens
4. Implement rate limiting on auth flows
5. Escape or replace RegExp search
6. Fix `.gitignore` and commit `.env.example`

### Phase 2 — Quality & Ops (1 week)

1. Vitest + CI pipeline (lint, build, test) — **done**
2. `/api/health` endpoint — **done**
3. Sentry or similar error tracking — **done** (optional via `SENTRY_DSN`)
4. Production env validation (`MONGODB_URI`, `AUTH_SECRET` required at startup) — **done**

### Phase 3 — Performance & UX (1 week)

1. Paginate applications; optimize global search — **done**
2. Cache dashboard/analytics aggregations — **done**
3. Remove fake overview trends; compute real deltas or hide — **done**
4. Permission-aware UI buttons — **done**
5. Server-side module route guards — **done**

### Phase 4 — Polish (ongoing)

1. Decrypt/mask PII on authorized views
2. Encrypt partner bank details
3. Cloudinary signed uploads
4. CSP header
5. `ALLOW_PUBLIC_REGISTRATION` env flag
6. Session expiry from Settings + remember me
7. Audit log UI

---

## Architecture Reference

```
Client (RSC + Client Components)
        │
        ▼
   proxy.ts (Auth middleware)
        │
        ▼
   lib/actions/*  ──requirePermission──►  lib/auth/*
        │                                        │
        ├──► lib/services/*                      │
        └──► models/* ──► MongoDB Atlas          │
```

**Target state:** Every data path (read and write) goes through `lib/actions/*` with explicit permission checks. Services remain internal — not imported from `app/` pages.

---

## Environment Checklist (Production)

| Variable | Required | Notes |
|----------|----------|-------|
| `MONGODB_URI` | Yes | Atlas with IP allowlist / VPC |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` / `NEXTAUTH_URL` | Yes | Must match deployed URL |
| `SMTP_*` | Yes | For OTP and approval emails |
| `APP_ENCRYPTION_KEY` | Yes | 32-byte hex; rotate with re-encryption plan |
| `CLOUDINARY_*` | If uploads used | Restrict upload preset |
| `SEED_ADMIN_*` | First deploy only | Run `npm run seed` once; remove from prod env after |

---

## Quick Wins (Can Do Today)

- [x] Add `requirePermission` to `getStudents`, `getPartners`, `getApplications`, `globalSearchAction`
- [x] Block `super_admin` in `createUserAction`
- [x] Remove hardcoded `↑ 24%` trends from overview
- [x] Fix `.gitignore` for `.env.example`
- [x] Add `GET /api/health` with DB ping
- [x] Escape regex in `search.service.ts`

> **Phase 1 security (implemented):** RBAC on reads, dashboard/analytics actions, rate limiting, hashed reset tokens, role escalation fixes, safe RegExp, `.gitignore` fix.

---

## Conclusion

The CRM has a **solid product foundation** — onboarding flow, dashboard, RBAC model, logging, and UI are ahead of many early-stage internal tools. The gap between “works in dev” and “safe in production” is mainly **read-path authorization**, **auth hardening**, and **operational tooling**.

Addressing the **Critical** and **High** items above will make the app suitable for real users handling sensitive student and financial data.

---

*Generated from full codebase review. Re-run this audit after major feature releases or before production launch.*
