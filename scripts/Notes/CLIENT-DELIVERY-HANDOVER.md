# Lakshya International Edwise CRM — Client Delivery & Handover Notes

**Document version:** 1.0  
**Application version:** 0.1.1  
**Prepared for:** Client handover & operational reference  
**Last updated:** June 2026  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Identity & Branding](#2-product-identity--branding)
3. [Technology Stack](#3-technology-stack)
4. [Access, URLs & First Login](#4-access-urls--first-login)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Application Navigation Map](#6-application-navigation-map)
7. [Global Features (Available Everywhere)](#7-global-features-available-everywhere)
8. [Module: Overview Dashboard](#8-module-overview-dashboard)
9. [Module: Students](#9-module-students)
10. [Module: Partners](#10-module-partners)
11. [Module: Applications (Pipeline)](#11-module-applications-pipeline)
12. [Module: Reports](#12-module-reports)
13. [Module: Analytics](#13-module-analytics)
14. [Module: Audit Log](#14-module-audit-log)
15. [Module: Settings](#15-module-settings)
16. [Module: Profile & Account](#16-module-profile--account)
17. [Authentication & Onboarding Flows](#17-authentication--onboarding-flows)
18. [Student Lifecycle Statuses](#18-student-lifecycle-statuses)
19. [Bulk Import Specification](#19-bulk-import-specification)
20. [Security, Privacy & Compliance](#20-security-privacy--compliance)
21. [White-Label & Environment Configuration](#21-white-label--environment-configuration)
22. [Deployment & DevOps](#22-deployment--devops)
23. [Backup, Maintenance & Support](#23-backup-maintenance--support)
24. [Known Limitations & Future Enhancements](#24-known-limitations--future-enhancements)

---

## 1. Executive Summary

**Lakshya International Edwise CRM** is a production-grade, white-label-ready **Education & Loan Consultancy CRM**. It is designed for consultancies that manage student loan applications, partner networks, and end-to-end loan lifecycle tracking from lead intake through disbursement.

### Core value delivered

| Area | Capability |
|------|------------|
| Student management | Full CRM profiles, documents, notes, timeline, loan tracking |
| Partner network | Commission tracking, performance analytics, student linkage |
| Application pipeline | Kanban drag-and-drop + table views for loan processing |
| Business intelligence | Dashboard KPIs, reports (CSV/Excel/PDF), advanced analytics |
| Compliance | Immutable audit log with filters, export, and detail traceability |
| Multi-user access | Role-based permissions from Super Admin to read-only Viewer |
| White-label | Company branding, module toggles, theme — configurable without code |

### Target users

- **Consultancy owners / admins** — settings, users, reports, audit
- **Managers** — students, partners, applications, analytics
- **Staff** — day-to-day student and application processing
- **Viewers** — read-only dashboards and reports

---

## 2. Product Identity & Branding

| Item | Value |
|------|-------|
| Product name | Lakshya International Edwise |
| Package / slug | `lakshya-international-edwise` |
| Default company name | Lakshya International Edwise (overridable via Settings or env) |
| Student ID format | `STU-LIE-000001` (sequential, configurable code via `APP_STUDENT_ID_CODE`) |
| Default dev port | `4000` |
| UI tagline (sidebar) | Enterprise CRM |

Branding appears in:

- Browser tab title (`Page | Company Name`)
- Sidebar logo and company name
- Mobile top bar
- Login / auth screens
- Email templates (when SMTP configured)
- PWA manifest

---

## 3. Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| Backend | Next.js Server Actions, MongoDB Atlas, Mongoose |
| Authentication | Auth.js (NextAuth v5), JWT sessions, RBAC |
| File storage | Cloudinary (photos, logos, documents) |
| Email | Nodemailer + SMTP |
| Charts | Recharts |
| Tables | TanStack Table |
| Forms & validation | React Hook Form + Zod |
| Drag & drop | @dnd-kit (application Kanban) |
| Error monitoring | Sentry |
| Rate limiting | rate-limiter-flexible (+ optional Redis) |
| PWA | Web manifest, offline fallback page |
| CI/CD | GitHub Actions (lint, test, build, deploy) |
| Container | Docker + docker-compose |

---

## 4. Access, URLs & First Login

### Primary routes

| Route | Purpose |
|-------|---------|
| `/` | Redirects to dashboard or login |
| `/login` | Sign in |
| `/register` | Self-registration (only if `ALLOW_PUBLIC_REGISTRATION=true`) |
| `/forgot-password` | Password reset request |
| `/reset-password` | Set new password via token |
| `/verify-email` | Email verification |
| `/verify-otp` | OTP verification |
| `/pending-approval` | Shown to users awaiting admin approval |
| `/dashboard/overview` | Main dashboard (default landing) |
| `/dashboard/students` | Student list |
| `/dashboard/partners` | Partner list |
| `/dashboard/applications` | Application pipeline |
| `/dashboard/reports` | Reports |
| `/dashboard/analytics` | Analytics |
| `/dashboard/audit` | Audit log (permission-gated) |
| `/dashboard/settings` | System settings |
| `/dashboard/profile` | User profile |
| `/offline` | PWA offline fallback |

### First-time setup (for administrators)

```bash
cp .env.example .env.local   # configure secrets
npm install
npm run seed                 # creates roles, settings, super admin
npm run dev                  # http://localhost:4000
```

Seed creates a **Super Admin** using `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_NAME` from environment.

---

## 5. User Roles & Permissions

### Role hierarchy

| Role | Label | Summary |
|------|-------|---------|
| `super_admin` | Super Admin | Full access to everything (`*` permission) |
| `admin` | Admin | All modules + user management + audit (no super_admin creation) |
| `manager` | Manager | CRUD students/partners/applications + reports + analytics |
| `staff` | Staff | Students + applications (read/write), partners (read), basic reports |
| `viewer` | Viewer | Read-only across students, partners, applications, reports, analytics |

### Permission matrix

| Permission | Super Admin | Admin | Manager | Staff | Viewer |
|------------|:-----------:|:-----:|:-------:|:-----:|:------:|
| `students:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `students:write` | ✓ | ✓ | ✓ | ✓ | — |
| `students:delete` | ✓ | ✓ | — | — | — |
| `students:export` | ✓ | ✓ | ✓ | — | — |
| `partners:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `partners:write` | ✓ | ✓ | ✓ | — | — |
| `partners:delete` | ✓ | ✓ | — | — | — |
| `applications:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `applications:write` | ✓ | ✓ | ✓ | ✓ | — |
| `reports:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `reports:export` | ✓ | ✓ | ✓ | — | — |
| `analytics:read` | ✓ | ✓ | ✓ | — | ✓ |
| `settings:read` | ✓ | ✓ | ✓ | — | — |
| `settings:write` | ✓ | ✓ | — | — | — |
| `users:read` | ✓ | ✓ | — | — | — |
| `users:write` | ✓ | ✓ | — | — | — |
| `users:delete` | ✓ | — | — | — | — |
| `roles:manage` | ✓ | — | — | — | — |
| `audit:read` | ✓ | ✓ | — | — | — |

### Module visibility

Modules can be **enabled or disabled** independently in Settings → Modules. Disabled modules are hidden from the sidebar and blocked at the route level.

| Module key | Menu label | Can disable? |
|------------|------------|:------------:|
| `students` | Students | ✓ |
| `partners` | Partners | ✓ |
| `applications` | Applications | ✓ |
| `reports` | Reports | ✓ |
| `analytics` | Analytics | ✓ |

Overview, Audit Log, and Settings are always available (Audit Log requires `audit:read` permission).

---

## 6. Application Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (Desktop) / BOTTOM NAV (Mobile)                    │
├─────────────────────────────────────────────────────────────┤
│  Overview          → /dashboard/overview                    │
│  Students          → /dashboard/students                    │
│  Partners          → /dashboard/partners                    │
│  Applications      → /dashboard/applications              │
│  Reports           → /dashboard/reports                     │
│  Analytics         → /dashboard/analytics                   │
│  Audit Log         → /dashboard/audit                       │
│  Settings          → /dashboard/settings                    │
├─────────────────────────────────────────────────────────────┤
│  Profile (footer)  → /dashboard/profile                     │
└─────────────────────────────────────────────────────────────┘

TOP BAR (all dashboard pages)
├── Global Search (⌘K / Ctrl+K)
├── Notifications bell
├── Theme toggle (Light / Dark / System)
└── User menu (Profile, Sign out)
```

---

## 7. Global Features (Available Everywhere)

### 7.1 Global Search

| Feature | Detail |
|---------|--------|
| Shortcut | `⌘K` (Mac) / `Ctrl+K` (Windows/Linux) |
| Minimum query | 2 characters |
| Debounce | 300 ms |
| Search scope | Students, Partners, Applications |
| Results | Grouped by type with title + subtitle |
| Action | Click result → navigate to record |

Search fields include: student name, phone, email, student ID, application number, partner company name.

### 7.2 Notifications

| Feature | Detail |
|---------|--------|
| Location | Top bar bell icon |
| Unread badge | Shows count (9+ cap) |
| Actions | Click notification → mark read + navigate; "Mark all read" |
| Content | Title, body, relative timestamp |

### 7.3 Theme

| Option | Behavior |
|--------|----------|
| Light | Fixed light theme |
| Dark | Fixed dark theme |
| System | Follows OS preference |

Persisted via `next-themes`.

### 7.4 Responsive layout

| Breakpoint | Behavior |
|------------|----------|
| Desktop (lg+) | Collapsible sidebar (260px ↔ 80px) |
| Tablet / Mobile | Bottom navigation bar + hamburger menu sheet |
| Safe areas | Mobile nav respects `safe-area-inset-bottom` |

### 7.5 PWA (Progressive Web App)

- Web manifest at `/manifest.webmanifest`
- Apple icon support
- Offline page at `/offline`
- Installable on supported browsers/devices

### 7.6 Toast notifications

Success/error feedback for all major actions (save, import, export, delete, etc.) via Sonner toasts.

---

## 8. Module: Overview Dashboard

**Route:** `/dashboard/overview`  
**Access:** Any user with at least one read permission (students, partners, applications, analytics, or reports)

### 8.1 Hero section

- Time-based greeting (Good Morning / Afternoon / Evening)
- Logged-in user name

### 8.2 KPI metric cards (9 cards)

Each card shows value, trend indicator, and sparkline chart.

| Metric | Description |
|--------|-------------|
| Total Students | All students in system |
| New Students Today | Created today |
| Partners | Active partner count |
| Pending Applications | Applications in pre-completion statuses |
| Sanctioned | Students/applications in sanctioned status |
| Disbursed | Disbursed count |
| Rejected | Rejected count |
| Loan Amount | Total loan value (INR formatted) |
| Today's Collection | Disbursement collection for today |

Trend labels show month-over-month comparison ("↑ new" / "↓" etc.).

### 8.3 Charts (2×2 grid)

| Chart | Data shown |
|-------|------------|
| Loan Status Pie | Distribution by student/application status |
| Monthly Students Area | New student registrations over time |
| Loan Amount Bar | Loan amounts by period |
| Top Partners Bar | Partner performance by linked students/loans |

Empty states shown when no data exists.

### 8.4 Activity & lists (3-column section)

| Widget | Content |
|--------|---------|
| Recent Activity | Timeline of latest CRM actions |
| Latest Students | Recent student cards with status |
| Latest Partners | Partner list with student count + status badge |

### 8.5 Follow-up reminders

When students have notes with due dates, a **Follow-up Cards** section appears showing:

- Student name
- Note content
- Due date

---

## 9. Module: Students

**Route:** `/dashboard/students`  
**Module toggle:** `students`  
**Permissions:** Read (list/view), Write (create/edit/import), Delete (bulk delete), Export (CSV)

### 9.1 Student list page

#### Toolbar actions

| Action | Permission | Description |
|--------|------------|-------------|
| Search | Read | Filter by name, phone, email, student ID |
| Status filter | Read | Filter by any student status |
| Filter button | Read | Apply search + status to URL |
| Add Student | Write | Navigate to create form |
| Import | Write | Bulk import dialog (CSV/Excel) |
| Export | Export | Download current page as CSV |
| Bulk Delete | Delete | Delete selected rows (checkbox selection) |

#### Table columns

| Column | Sortable | Notes |
|--------|:--------:|-------|
| Checkbox | — | Delete permission only |
| Student ID | ✓ | Links to detail page (`STU-LIE-000001` format) |
| Name | ✓ | First + last name |
| Phone | ✓ | |
| Partner | ✓ | Assigned partner company name |
| Loan | ✓ | Requested amount (INR) |
| Status | ✓ | Color-coded badge |
| Created | ✓ | Date added |

#### Pagination

- Page size: 20 (default)
- Previous / Next navigation
- Total count displayed

### 9.2 Create student

**Route:** `/dashboard/students/new`

#### Form sections & fields

**Required**

| Field | Validation |
|-------|------------|
| First Name * | Required text |
| Last Name * | Required text |

**Optional — Personal & Contact**

| Field | Validation |
|-------|------------|
| Gender | male / female / other |
| Date of Birth | Date picker |
| Phone | 10-digit Indian mobile (6–9 start); +91 optional |
| WhatsApp | Same as phone |
| Email | Valid email |
| Photo | Cloudinary upload (JPEG/PNG/WebP, max 10 MB) |

**Optional — Address**

| Field | Validation |
|-------|------------|
| Address | Free text |
| City | Free text |
| State | Free text |
| Pincode | 6-digit Indian postal code |

**Optional — Documents & Education**

| Field | Validation |
|-------|------------|
| Aadhaar | 12 digits (encrypted at rest) |
| PAN | ABCDE1234F format (encrypted at rest) |
| College | Free text |
| Course | Free text |
| Year | Free text (year of study) |

**Optional — Loan & Application**

| Field | Validation |
|-------|------------|
| Loan Amount Requested | Number ≥ 0 |
| Sanctioned Amount | Number ≥ 0 |
| Disbursed Amount | Number ≥ 0 |
| Interest % | 0–100, decimal (e.g. 7.8) |
| Bank Name | Free text |
| Application Number | Free text |
| Partner | Dropdown of active partners |
| Status | Full lifecycle status (default: new) |
| Remarks | Multi-line text |

#### On create

- Auto-generates sequential **Student ID** (`STU-{CODE}-{000001}`)
- Creates linked **Application** record
- Increments partner student count + loan value (if partner assigned)
- Adds timeline entry ("Imported via bulk upload" or creation note)
- Logs activity + audit entry

### 9.3 Student detail page

**Route:** `/dashboard/students/[id]`

#### Header card

- Photo avatar
- Full name + Student ID
- Status badge
- Edit button (write permission)
- Contact summary: phone, email, created date
- Masked Aadhaar / PAN display

#### Tabs

| Tab | Features |
|-----|----------|
| **Timeline** | Chronological status history with notes and author |
| **Documents** | Upload documents (write); view/download uploaded files |
| **Loan History** | Requested, sanctioned, disbursed, interest %, bank, application # |
| **Notes** | Add notes with optional due date (write); follow-up tracking |
| **Partner** | Linked partner with link to partner profile |

### 9.4 Edit student

**Route:** `/dashboard/students/[id]/edit`  
Same form as create, pre-filled. Status changes append timeline entries and sync application status.

### 9.5 Bulk import

See [Section 19 — Bulk Import Specification](#19-bulk-import-specification).

---

## 10. Module: Partners

**Route:** `/dashboard/partners`  
**Module toggle:** `partners`  
**Permissions:** Read, Write, Delete

### 10.1 Partner list page

#### Table columns

| Column | Description |
|--------|-------------|
| Company | Link to detail page |
| Owner | Contact person |
| Phone | |
| Students | Count of linked students |
| Loan Value | Total loan value (INR) |
| Commission | Commission percentage |
| Status | active / inactive / pending / suspended |

#### Pagination

- Previous / Next
- Total partner count

#### Actions

| Action | Route | Permission |
|--------|-------|------------|
| Add Partner | `/dashboard/partners/new` | Write |

### 10.2 Create / Edit partner

**Routes:** `/dashboard/partners/new`, `/dashboard/partners/[id]/edit`

#### Required

| Field | Notes |
|-------|-------|
| Company Name * | Unique identifier for import matching |

#### Optional — Company Details

| Field | Notes |
|-------|-------|
| Owner | Contact person name |
| Phone | 10-digit Indian mobile |
| Email | |
| GST | GST number |
| Commission % | Default commission rate |
| Status | active / inactive / pending / suspended |
| Address | Multi-line |
| Company Logo | Cloudinary upload |

#### Optional — Bank Details

| Field | Notes |
|-------|-------|
| Account Name | |
| Account Number | Encrypted at rest |
| IFSC | 11-char format (e.g. SBIN0001234) |
| Bank Name | |

### 10.3 Partner detail page

**Route:** `/dashboard/partners/[id]`

#### Summary cards

| Metric | Description |
|--------|-------------|
| Students | Linked student count |
| Total Loan Value | Sum of linked loan amounts |
| Sanction Rate | Performance percentage |
| Commission Earned | Calculated commission |

#### Information panel

- Status badge + commission %
- Phone, email, GST, address
- Bank details (masked account number when applicable)

#### Linked students table

List of all students assigned to this partner with key fields.

#### Analytics chart

Status distribution pie chart for partner's students.

---

## 11. Module: Applications (Pipeline)

**Route:** `/dashboard/applications`  
**Module toggle:** `applications`  
**Permissions:** Read (view), Write (drag/update status)

### 11.1 View modes

| View | URL param | Description |
|------|-----------|-------------|
| **Kanban** | `?view=kanban` (default) | Drag-and-drop pipeline board |
| **Table** | `?view=table` | Paginated table with search |

Toggle via tabs at top of page.

### 11.2 Kanban board

#### Columns (10 pipeline stages)

Each column corresponds to an application status:

1. New  
2. Contacted  
3. Documents Pending  
4. Submitted  
5. Under Verification  
6. Approved  
7. Sanctioned  
8. Disbursed  
9. Rejected  
10. Closed  

#### Card content

- Student name
- Student ID
- Loan amount (INR, highlighted)
- Partner name (if assigned)

#### Drag & drop (write permission)

- Drag card between columns to change status
- Updates application status + pipeline stage
- Syncs linked student status
- Appends student timeline entry
- Logs audit activity

Read-only users see cards but cannot drag.

### 11.3 Table view

| Column | Description |
|--------|-------------|
| Student | Name + ID |
| Partner | Company name |
| Loan Amount | INR formatted |
| Status | Badge |
| Priority | low / medium / high / urgent |
| Updated | Last update date |

Supports pagination and search (`?search=`).

---

## 12. Module: Reports

**Route:** `/dashboard/reports`  
**Module toggle:** `reports`  
**Permissions:** Read (generate/view), Export (CSV/Excel/PDF)

### 12.1 Date range presets

| Preset | Period |
|--------|--------|
| Daily | Today |
| Weekly | Current week |
| Monthly | Current month |
| Yearly | Current year |

### 12.2 Report types

| Type | Label | Columns (business-friendly) |
|------|-------|-------------------------------|
| `student` | Student Wise | Student ID, Full Name, Gender, DOB, Phone, WhatsApp, Email, Address, Aadhaar (masked), PAN (masked), College, Course, Year, Loan Requested/Sanctioned/Disbursed, Interest %, Bank, Application No., Partner, Status, Remarks, Documents count, Notes count, Last Status/Update, Created By/On, Updated On |
| `partner` | Partner Wise | Company, Students, Total Loan Value, Commission %, Commission Earned, Status |
| `loan` | Loan Wise | Status, Count, Total Requested, Total Sanctioned, Total Disbursed |

### 12.3 Actions

| Action | Format | Permission |
|--------|--------|------------|
| Generate Report | On-screen table | Read |
| Export CSV | `.csv` download | Export |
| Export Excel | `.xlsx` download | Export |
| Export PDF | `.pdf` download | Export |
| Print | Browser print dialog | Export |

---

## 13. Module: Analytics

**Route:** `/dashboard/analytics`  
**Module toggle:** `analytics`  
**Permission:** `analytics:read`

### 13.1 Charts & visualizations

| Chart | Purpose |
|-------|---------|
| Conversion Funnel | Student journey stage conversion |
| Trend Line | Application/student trends over time |
| Revenue Bar | Loan revenue by period |
| Top Partners Bar | Partner disbursement performance |
| Gender Distribution | Demographic pie chart |
| State Distribution | Geographic pie chart |
| Loan Distribution | Loan amount tier breakdown |
| Heat Map Grid | Activity intensity by day/hour |

Empty states shown when insufficient data.

---

## 14. Module: Audit Log

**Route:** `/dashboard/audit`  
**Permission:** `audit:read` (Admin and Super Admin by default)

### 14.1 Summary statistics

| Card | Metric |
|------|--------|
| Total events | All-time audit entries |
| Today | Events in last 24 hours |
| Last 7 days | Weekly activity |
| Top resource | Most-audited resource type + count |

### 14.2 Filters

| Filter | Options |
|--------|---------|
| Search | Action, user, description, IP |
| Resource type | student, partner, application, settings, user, all |
| Action group | Student events, bulk imports, applications, partners, settings, all |
| Time range | Today, Last 7 days, Last 30 days, All time |

### 14.3 Audit table columns

| Column | Description |
|--------|-------------|
| Time | Date and time (IST formatted) |
| User | Who performed the action |
| Action | Color-coded badge (e.g. Student · Updated) |
| Description | Human-readable event summary |
| Resource | Type + short ID with link where applicable |
| IP | Client IP address |
| Details | View button → detail panel |

### 14.4 Detail panel (slide-over)

| Field | Description |
|-------|-------------|
| Description | Full event narrative |
| User & timestamp | Actor and exact time |
| Resource | Type, full ID, "Open resource" link |
| IP address | Client IP |
| Browser / device | Parsed user agent |
| Full user agent | Raw string |
| Metadata | JSON (e.g. import counts) |
| Changes | Diff when recorded |

### 14.5 Export

- **Export CSV** — up to 1,000 filtered entries
- Columns: Time, User, Action, Description, Resource Type, Resource ID, IP, User Agent, Metadata

### 14.6 Tracked actions (examples)

| Action code | When logged |
|-------------|-------------|
| `student.created` | New student added |
| `student.updated` | Student record edited |
| `student.deleted` | Student removed |
| `students.imported` | Bulk import completed |
| `application.status_changed` | Pipeline status change |
| `partner.created` / `updated` / `deleted` | Partner CRUD |
| Settings changes | Company, modules, security updates |

New events capture IP address and browser automatically.

---

## 15. Module: Settings

**Route:** `/dashboard/settings`  
**Permissions:** Read (view), Write (save), Users (admin manage)

### 15.1 Tab: Company

| Field | Required | Description |
|-------|:--------:|-------------|
| Company Name | ✓ | Displayed across app |
| Email | | Contact email |
| Phone | | Contact phone |
| Address | | Business address |
| Company Logo | | Cloudinary image upload |

Save button: **Save Company Settings**

### 15.2 Tab: Modules

Toggle each module on/off:

| Module | Effect when disabled |
|--------|---------------------|
| Students | Hidden from nav; routes blocked |
| Partners | Hidden from nav; routes blocked |
| Applications | Hidden from nav; routes blocked |
| Reports | Hidden from nav; routes blocked |
| Analytics | Hidden from nav; routes blocked |

Save button: **Save Modules**

### 15.3 Tab: Security (write permission)

| Setting | Range | Description |
|---------|-------|-------------|
| Session expiry (hours) | 1–720 | Default JWT session length |

Note: "Remember me" on login extends session by 7× on next sign-in.

Save button: **Save Security Settings**

### 15.4 Tab: Users (admin / super admin)

#### Approval queue

When public registration is enabled, verified users appear here awaiting approval.

| Action | Description |
|--------|-------------|
| Approve | Assign role and activate account |
| Reject | Remove pending user |
| Role selector | staff, manager, admin, viewer (not super_admin) |

#### Add user form

| Field | Required |
|-------|:--------:|
| Full Name | ✓ |
| Email | ✓ |
| Password | ✓ |
| Role | ✓ (dropdown based on current user's level) |

Role creation rules:

- Super Admin can create Admin and below
- Admin cannot create Super Admin
- Admin role assignable only by Super Admin

#### User table

| Column | Actions |
|--------|---------|
| Name, Email, Role, Status | Delete user (admin) |

User statuses: Pending Approval, Active, Inactive, Suspended

---

## 16. Module: Profile & Account

**Route:** `/dashboard/profile`

| Section | Fields / Actions |
|---------|------------------|
| Profile header | Avatar, name, email, role badge |
| Edit profile | Full Name, Email |
| Change password | Current password, New password, Confirm password |
| Save | Updates profile + password (if provided) |

Accessible from sidebar footer avatar or top bar user menu.

---

## 17. Authentication & Onboarding Flows

### 17.1 Login

| Field | Notes |
|-------|-------|
| Email | Required |
| Password | Required (min 6 chars) |
| Remember me | Extends session 7× on next login |

Links: Forgot password, Register (if public registration enabled)

### 17.2 Registration (optional)

Controlled by `ALLOW_PUBLIC_REGISTRATION` env (default: **disabled**).

Flow when enabled:

1. User registers → account created as **pending**
2. Email verification sent
3. User verifies email → appears in Settings approval queue
4. Admin approves with role → account active

### 17.3 Password reset

1. Forgot password → enter email
2. Reset link emailed (SMTP required)
3. Set new password on reset page

### 17.4 Email verification

- `/verify-email` — token-based email confirmation
- `/verify-otp` — 6-digit OTP verification

### 17.5 Session security

- JWT-based sessions via Auth.js
- Rate limiting on auth endpoints
- Permission checks on every server action
- Route-level guards via middleware

---

## 18. Student Lifecycle Statuses

| Status | Label | Typical meaning |
|--------|-------|-----------------|
| `new` | New | Lead just entered |
| `contacted` | Contacted | Initial outreach done |
| `documents_pending` | Documents Pending | Awaiting student documents |
| `submitted` | Submitted | Application submitted to bank |
| `under_verification` | Under Verification | Bank verification in progress |
| `approved` | Approved | Pre-sanction approval |
| `sanctioned` | Sanctioned | Loan sanctioned |
| `disbursed` | Disbursed | Funds disbursed |
| `rejected` | Rejected | Application rejected |
| `closed` | Closed | Case closed |

Statuses are shared between **Students** and **Applications** and stay synchronized on updates.

---

## 19. Bulk Import Specification

**Access:** Students list → Import button (write permission)

### 19.1 Supported formats

| Format | Extension | Max size |
|--------|-----------|----------|
| CSV | `.csv` | 5 MB |
| Excel | `.xlsx`, `.xls` | 5 MB |

### 19.2 Limits

- Maximum **500 rows** per import
- Partner company name must match an **active** partner in CRM

### 19.3 Template download

- Format: `.xlsx` (Excel workbook)
- **Sheet 1 — Student Import:** Headers + 5 sample rows
- **Sheet 2 — Instructions:** Field guide and valid values

### 19.4 Import columns (25 fields)

| # | Column | Required | Notes |
|---|--------|:--------:|-------|
| 1 | First Name | ✓ | |
| 2 | Last Name | ✓ | |
| 3 | Phone Number | | 10-digit Indian |
| 4 | WhatsApp Number | | |
| 5 | Email Address | | |
| 6 | Gender | | male / female / other |
| 7 | Date of Birth | | YYYY-MM-DD |
| 8 | Address Line | | |
| 9 | City | | |
| 10 | State | | |
| 11 | Pincode | | 6 digits |
| 12 | Aadhaar Number | | 12 digits |
| 13 | PAN Number | | ABCDE1234F |
| 14 | College / University | | |
| 15 | Course | | |
| 16 | Year of Study | | |
| 17 | Loan Requested (INR) | | Number only |
| 18 | Loan Sanctioned (INR) | | |
| 19 | Loan Disbursed (INR) | | |
| 20 | Interest Rate (%) | | 0–100 |
| 21 | Bank Name | | |
| 22 | Application Number | | |
| 23 | Partner Company | | Must match CRM partner |
| 24 | Status | | Lifecycle status |
| 25 | Remarks | | |

### 19.5 Import behavior

- Each row gets auto-generated Student ID
- Creates student + application records
- Updates partner metrics
- Partial success supported (reports imported vs failed counts)
- Row-level error messages on failure
- Logs `students.imported` audit entry with metadata

---

## 20. Security, Privacy & Compliance

### 20.1 Data encryption

| Data | Storage |
|------|---------|
| Aadhaar | AES-256-GCM encrypted (`APP_ENCRYPTION_KEY`) |
| PAN | AES-256-GCM encrypted |
| Partner bank account | AES-256-GCM encrypted |
| Passwords | bcrypt hashed |

Display uses masking (e.g. `XXXX-XXXX-1234` for Aadhaar).

### 20.2 Audit trail

- Immutable audit log for all CRM mutations
- IP address + user agent on new events
- Exportable for compliance review

### 20.3 Rate limiting

Applied to:

- Login attempts
- Registration
- Password reset
- Bulk import operations

### 20.4 Input validation

- Zod schemas on all server actions
- Indian field validators (phone, Aadhaar, PAN, pincode, IFSC)
- XSS sanitization on text fields
- File type/size validation on uploads

### 20.5 Error monitoring

- Sentry integration for production error tracking
- Structured server-side logging

---

## 21. White-Label & Environment Configuration

### 21.1 Branding (env or Settings)

| Variable | Purpose |
|----------|---------|
| `APP_COMPANY_NAME` | Company display name |
| `APP_COMPANY_EMAIL` | Contact email |
| `APP_COMPANY_PHONE` | Contact phone |
| `APP_COMPANY_ADDRESS` | Address |
| `APP_COMPANY_LOGO` | Logo URL |
| `APP_STUDENT_ID_CODE` | Student ID prefix code (default: LIE) |

Env values override database settings for immediate rebranding.

### 21.2 Theme (env defaults)

| Variable | Purpose |
|----------|---------|
| `APP_THEME_PRIMARY` | Primary color (OKLCH) |
| `APP_THEME_ACCENT` | Accent color |
| `APP_THEME_RADIUS` | Border radius |
| `APP_THEME_FONT` | Font family |
| `APP_THEME_MODE` | light / dark / system |

### 21.3 Module toggles (env defaults)

| Variable | Default |
|----------|---------|
| `APP_MODULE_STUDENTS` | true |
| `APP_MODULE_PARTNERS` | true |
| `APP_MODULE_APPLICATIONS` | true |
| `APP_MODULE_REPORTS` | true |
| `APP_MODULE_ANALYTICS` | true |

Set to `false` to disable by default.

### 21.4 Required secrets

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection |
| `AUTH_SECRET` | Session signing (32+ chars) |
| `APP_ENCRYPTION_KEY` | 64-char hex for PII encryption |
| `CLOUDINARY_*` | File uploads |
| `SMTP_*` | Email (verification, reset, notifications) |

### 21.5 Optional secrets

| Variable | Purpose |
|----------|---------|
| `SENTRY_DSN` | Error monitoring |
| `REDIS_URL` | Distributed rate limiting |
| `ALLOW_PUBLIC_REGISTRATION` | Enable self-registration (default: false) |
| `SEED_ADMIN_*` | Initial admin credentials for seed |

---

## 22. Deployment & DevOps

### 22.1 NPM scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (port 4000) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run seed` | Seed database |
| `npm run backup:mongodb` | MongoDB backup script |

### 22.2 GitHub Actions workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| Code Quality Gate | Push, PR | Lint + test + build |
| Bump Version & Tag | Manual | Version bump + git tag |
| Deploy Application | Manual | Deploy to Docker/Fly/VPS/Vercel |

### 22.3 Deployment platforms

- Docker / VPS (`docker compose up`)
- GitHub Container Registry
- Fly.io
- Render (render.yaml)
- Railway
- Vercel

### 22.4 CI quality gates

- ESLint (zero warnings policy in CI)
- 78+ unit tests
- Playwright E2E (auth, dashboard flows)
- Production build verification

---

## 23. Backup, Maintenance & Support

### 23.1 Database backup

```bash
npm run backup:mongodb
# or
bash scripts/backup-mongodb.sh
```

Requires `MONGODB_URI` in environment.

### 23.2 Branding sync

```bash
npm run sync:branding   # re-runs seed to sync env branding to DB
```

### 23.3 Routine maintenance checklist

| Task | Frequency | Command / Location |
|------|-----------|-------------------|
| Database backup | Daily (recommended) | `npm run backup:mongodb` |
| Review audit log | Weekly | Settings → Audit Log |
| User access review | Monthly | Settings → Users |
| Dependency updates | Quarterly | `npm update` + CI |
| Encryption key rotation | As needed | Update env + re-encrypt PII |

### 23.4 Support contacts

Configure in deployment documentation:

- **Technical support:** [Your dev team contact]
- **Super Admin account:** Created via seed (`SEED_ADMIN_EMAIL`)
- **MongoDB Atlas:** Database hosting dashboard
- **Cloudinary:** Media asset management
- **Sentry:** Error monitoring dashboard

---

## 24. Known Limitations & Future Enhancements

### Current limitations

| Item | Detail |
|------|--------|
| Public registration | Disabled by default; must be explicitly enabled |
| Audit log historical data | Older entries may lack description/IP (pre-upgrade) |
| Partner list | No bulk import (students only) |
| Application priority | Set programmatically; limited UI in Kanban |
| Redis | Optional; falls back to in-memory rate limiting |

### Suggested future enhancements

- Email notification templates customization in Settings UI
- Partner bulk import
- Custom report builder / saved filters
- WhatsApp integration for student communication
- Mobile native app (PWA already installable)
- Multi-branch / multi-tenant support
- Automated follow-up reminder emails

---

## Appendix A — Quick Reference URLs

| Page | URL |
|------|-----|
| Dashboard | `/dashboard/overview` |
| Students | `/dashboard/students` |
| New Student | `/dashboard/students/new` |
| Partners | `/dashboard/partners` |
| Applications (Kanban) | `/dashboard/applications` |
| Applications (Table) | `/dashboard/applications?view=table` |
| Reports | `/dashboard/reports` |
| Analytics | `/dashboard/analytics` |
| Audit Log | `/dashboard/audit` |
| Settings | `/dashboard/settings` |
| Profile | `/dashboard/profile` |
| Login | `/login` |

## Appendix B — Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open global search |

## Appendix C — File & Folder Reference (for administrators)

| Path | Purpose |
|------|---------|
| `scripts/seed.ts` | Database seeding |
| `scripts/backup-mongodb.sh` | DB backup |
| `scripts/Notes/` | Project documentation (this file) |
| `Banners/test/student-import-template.csv` | Sample import CSV for testing |
| `.github/workflows/` | CI/CD pipelines |
| `lib/constants/permissions.ts` | Role permission definitions |
| `lib/constants/statuses.ts` | Status labels and colors |

---

**End of document**

*This handover note reflects the application as delivered at version 0.1.1. For technical change history, refer to git tags and `.github/workflows/release/release.properties`.*
