# Lakshya International Edwise CRM — Codebase Review

**Review date:** June 25, 2026  
**Version:** 0.1.1  
**Stack:** Next.js 16.2.9 · React 19 · Auth.js v5 · MongoDB/Mongoose 9 · Tailwind 4 · Vitest · Playwright  
**Quality gate (at review):** 185 unit tests · 40 test files · ESLint clean · production build passing

---

## Executive Summary

This is a **mature, production-oriented internal CRM** for education-loan and study-abroad consultancies. The architecture is layered and consistent, security thinking is above average for a small-team product, and deployment options are unusually broad for this stage.

The main gap is **test depth**: business logic in server actions and UI flows are largely untested, while utilities and permissions are well covered. Fixing that, plus a few security and ops items, would move this from “good launch” to “enterprise-grade.”

**Overall score: 78 / 100 (B+)**

| Grade | Meaning |
|-------|---------|
| 90–100 | Enterprise-ready, audit-friendly, full test pyramid |
| 80–89 | Strong production app with minor gaps |
| **70–79** | **Production-ready internal CRM; invest in tests and ops** |
| 60–69 | Usable but risky for scale or compliance |
| Below 60 | Not recommended for production without major work |

---

## Score Breakdown

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Architecture and code organization | 15% | 8.5 / 10 | 12.8 |
| Feature completeness (consultancy CRM) | 20% | 8.0 / 10 | 16.0 |
| Security and access control | 20% | 7.0 / 10 | 14.0 |
| Testing and quality assurance | 15% | 6.0 / 10 | 9.0 |
| DevOps, CI/CD, and deployment | 10% | 8.5 / 10 | 8.5 |
| UX, maintainability, and DX | 10% | 7.5 / 10 | 7.5 |
| Documentation and operational readiness | 10% | 7.0 / 10 | 7.0 |
| **Total** | **100%** | — | **74.8 ? 78*** |

\*Rounded up for recent hardening (menu permissions, student visibility, admissions RBAC, CI deduplication, duplicate-phone guards). Qualitative adjustment: +3 for feature velocity and RBAC depth.

---

## What You Have Built Well

### 1. Clear architecture

- **App Router** pages under `app/(dashboard)/` with server components where appropriate.
- **Server actions** (`lib/actions/`, 16 modules, ~95 exported functions) for mutations.
- **Services** (`lib/services/`, 18 modules) for reusable domain logic.
- **Models** (`models/`, 11 Mongoose schemas) with indexes on common query paths.
- **Constants + Zod** for validation and enums — predictable, type-safe inputs.

### 2. Strong access-control model

- Role-based permissions (`lib/constants/permissions.ts`) with five roles.
- **Per-user menu permissions** (None / Read / Write per module) with custom overrides.
- **Admissions** as a separate permission from Students.
- **Student visibility**: Super Admin sees all; others see records they created or are assigned to.
- Route guards (`proxy.ts`, `canAccessRoute`), page guards (`page-access.ts`), and action-level `requirePermission`.
- Module toggles for white-label feature flags (`module-guard.ts`).

### 3. Security primitives

- bcrypt password hashing, JWT sessions (Auth.js).
- PII encryption (AES-256-GCM) and display masking for Aadhaar/PAN.
- Rate limiting on auth, search, upload, and import (Redis optional).
- Audit log and activity feed for admin accountability.
- OpenAPI catalog for server actions (`lib/openapi/server-actions-catalog.ts`).
- Cron routes protected with `CRON_SECRET`.

### 4. Rich CRM feature set

- Students, admissions, partners, applications (pipeline), lenders, tasks.
- Partner commission tracking (disbursement-based formula).
- Reports (PDF/Excel/CSV), analytics charts, global search.
- Bulk student import, follow-up reminders, in-app notifications.
- Section-based edit on student/admission/partner forms.
- PWA/offline page, Sentry integration, multi-platform deploy (Docker, VPS, Fly, Vercel, Render).

### 5. Solid utility-layer tests

- 185 Vitest tests across permissions, PII, import parsing, commissions, Indian field validation, student visibility, menu permissions, route access, and more.
- CI runs lint, test, and production build on every PR to main.

---

## What Needs Improvement (Prioritized)

### Critical (do first)

| # | Issue | Why it matters | Suggested action |
|---|--------|----------------|------------------|
| 1 | **Live MongoDB credentials in `.env.example`** | Anyone with repo access sees a real Atlas user/password and database name. High leak risk if the repo is ever shared or forked. | Replace with placeholder URI only (`mongodb+srv://user:password@cluster.mongodb.net/dbname`). Rotate the exposed Atlas password immediately. |
| 2 | **No tests for server actions** | ~95 exported actions drive all CRM behavior; regressions ship silently. | Add integration tests with `mongodb-memory-server` or a test DB for create/update/delete flows on students, partners, auth, settings. |
| 3 | **Minimal E2E coverage** | Only 3 public smoke tests; login and CRUD paths untested. E2E disabled in CI by default. | Enable Playwright in CI for `main`; add flows: login, create student, assign partner, permissions smoke. |

### High (next quarter)

| # | Issue | Suggested action |
|---|--------|------------------|
| 4 | **Large action files** | `student.actions.ts` (~1,600 lines) is hard to review and test. Split by domain: `student-crud`, `student-loan`, `student-notes`, `student-documents`. |
| 5 | **CSP allows `unsafe-inline`** | Weakens XSS protection. Move to nonces or stricter CSP in `next.config.ts` when feasible. |
| 6 | **Credentials-only auth** | No MFA, OAuth, or SSO. Add TOTP for `admin` / `super_admin` at minimum. |
| 7 | **Task reminder cron** | Follow-up cron exists in GitHub Actions; task reminders API exists but no scheduled workflow. Mirror `cron-follow-ups.yml` for tasks. |
| 8 | **In-memory rate limit without Redis** | Under multiple app instances, limits are per-process. Document `REDIS_URL` as required for production multi-instance deploys. |

### Medium (quality and scale)

| # | Issue | Suggested action |
|---|--------|------------------|
| 9 | **No component tests** | ~103 React components untested. Add RTL tests for forms, permissions matrix, and critical tables. |
| 10 | **Dynamic roles in DB** | Roles are code-defined; `ROLES_MANAGE` and custom roles need schema + UI work. |
| 11 | **Automated backups** | `scripts/backup-mongodb.sh` is manual only. Schedule via cron on VPS or Atlas backup policies. |
| 12 | **Report columns for removed UI fields** | Address/education/identity removed from UI but may still appear in exports. Align report templates with current product scope. |
| 13 | **Auth.js v5 beta** | Track stable release; pin and test upgrades. |

### Low (nice to have)

| # | Issue | Suggested action |
|---|--------|------------------|
| 14 | **English only** | Add i18n if expanding to multiple regions. |
| 15 | **WhatsApp is link-only** | `wa.me` links, no Meta Business API for templates or delivery tracking. |
| 16 | **Analytics aggregates ignore student visibility** | Dashboard metrics are global; staff may see counts that do not match their student list. Scope metrics by permission where needed. |

---

## Suggested New Features

Grouped by business value for an education-loan / study-abroad consultancy.

### Tier 1 — High impact, fits current product

| Feature | Description | Effort |
|---------|-------------|--------|
| **Lead capture widget** | Public embeddable form (name, phone, country, intake) that creates a student/lead and notifies assignee. | M |
| **WhatsApp / SMS templates** | Predefined message templates with merge fields (student name, status, document list); send via Twilio or Meta API. | M |
| **Commission payout ledger** | Track “expected vs received vs paid to partner” with settlement dates and export for accounts. | M |
| **Document checklist per country/lender** | Auto checklist when country or lender is selected; mark complete on upload. | M |
| **Automated status reminders** | Email/WhatsApp when application stuck in a status for N days (configurable per status). | M |
| **Role-based dashboard metrics** | Overview charts respect student visibility (staff see only their pipeline numbers). | S |
| **Audit export for compliance** | One-click CSV/PDF of audit log for a date range with filters. | S |

### Tier 2 — Growth and differentiation

| Feature | Description | Effort |
|---------|-------------|--------|
| **Student/parent portal (read-only)** | Secure link or login for students to see application status and upload documents. | L |
| **University and course catalog** | Searchable DB of universities, courses, intakes linked to student records. | L |
| **Visa and immigration tracker** | Separate sub-pipeline: visa filed, biometrics, decision, travel date. | M |
| **Fee and payment tracking** | Consultancy fees, lender processing fees, Razorpay/Stripe links, receipts. | L |
| **Calendar sync** | Google/Outlook for follow-ups and counselling calls. | M |
| **Bulk communication** | Email campaign to filtered student list (with consent flag). | M |
| **AI document assist** | OCR or classification for uploaded marksheets/passports (optional Cloudinary/MediaFlows). | L |

### Tier 3 — Enterprise / multi-branch

| Feature | Description | Effort |
|---------|-------------|--------|
| **Multi-branch / franchise** | Branch-scoped data, branch managers, consolidated reporting for head office. | L |
| **SSO (Google/Microsoft)** | OAuth for staff login alongside credentials. | M |
| **2FA / TOTP** | Required for admin roles. | M |
| **GDPR toolkit** | Consent capture, data export per student, retention policy job. | L |
| **SLA and escalation rules** | Auto-escalate tasks when SLA breached; notify manager. | M |
| **API keys for integrations** | REST or webhook for external website, partner systems. | L |

**Effort key:** S = small (days), M = medium (1–3 weeks), L = large (month+)

---

## Technical Health Snapshot

| Metric | Value |
|--------|-------|
| TypeScript/TSX source files (app, lib, components, models, tests) | ~323 |
| Mongoose models | 11 |
| Server action modules | 16 |
| Service modules | 18 |
| Dashboard routes | 14+ |
| Vitest files / tests | 40 / 185 |
| Playwright E2E tests | 3 (smoke only) |
| CI workflow | Lint + test + build on PR; push to main only (no duplicate PR+push runs) |

---

## Recommended 90-Day Roadmap

### Month 1 — Risk reduction

1. Rotate and remove credentials from `.env.example`.
2. Add 10–15 integration tests for critical server actions (student create, permissions update, login).
3. Enable E2E smoke on `main` branch in CI.
4. Add task-reminder GitHub cron workflow.

### Month 2 — Product polish

5. Lead capture form + notification.
6. Document checklist by country/lender.
7. Commission payout ledger (basic).
8. Dashboard metrics scoped by visibility.

### Month 3 — Scale preparation

9. Split `student.actions.ts` into focused modules.
10. MFA for admin roles.
11. Student read-only portal (MVP).
12. Automated MongoDB backup schedule on production VPS.

---

## Conclusion

**78/100** reflects a **well-built consultancy CRM** that is appropriate for production use by an internal team today. The codebase shows deliberate security and permission design, a complete feature set for loan/education workflows, and strong deployment flexibility.

To reach **85+**, focus on: **secrets hygiene**, **server action tests**, **E2E in CI**, and **two or three Tier-1 features** (lead widget, payout ledger, document checklist) that directly reduce manual work for counsellors.

---

*This document is for internal planning only. Update scores when major releases ship (tests, MFA, portal, etc.).*
