# EpiCred vs Lakshya International Edwise — Competitive Analysis & Development Roadmap

**Date:** July 1, 2026  
**Competitor:** [EpiCred](https://epicred.in/) — education loan marketplace & study-abroad finance aggregator  
**Our site:** [lakshyainternationaledwise.com](https://lakshyainternationaledwise.com)  
**Scope:** Public marketing site + lead capture + CRM capabilities (what students see vs what we operate internally)

---

## Executive summary

EpiCred is positioned primarily as a **free education-loan marketplace** with a large toolkit, country SEO hub, and student signup funnel. Their homepage optimizes for **loan + scholarship search**, lender comparison, and **zero-fee counseling**.

Lakshya is positioned as a **full study-abroad consultancy** (counselling → university → loan → visa → travel) with a **production-grade CRM** behind the website. Our marketing site is polished, but we are **missing the loan-first tools, scholarship discovery, student portal, and SEO depth** that make EpiCred feel like a product platform—not just a consultancy brochure.

**Strategic takeaway:** EpiCred wins on **self-serve tools + loan comparison + SEO scale**. Lakshya can win on **end-to-end human consultancy, admissions depth, CRM operations, and trust**—if we add a focused “loan tools” layer and country SEO without copying their entire product surface area.

---

## 1. Competitor snapshot — EpiCred (top to bottom)

### 1.1 Homepage hero & primary CTAs

| Element | EpiCred |
|--------|---------|
| Headline | “Education Loan for your Dream Destination” |
| Sub-actions | **Search for Scholarship**, **Get an Education Loan** |
| Filters | Course Level, Scholarship Type, Country (interactive search) |
| Trust stats | ₹150 Cr+ disbursed · 600+ students · 35+ countries · 4.9★ Google |

**Our equivalent:** Hero focuses on consultancy + consultation CTA; no scholarship search or loan-first dual CTA on homepage.

---

### 1.2 Loan journey (5 steps)

1. Sign up on EpiCred  
2. View offers from **15+ lenders** (lowest rate positioning)  
3. Shortlist with **Fund Advisor**  
4. Upload documents  
5. Loan approval & disbursement  

**Our equivalent:** 7-step journey (Dream → Consultation → University → Loan → Visa → Travel → Career) — broader, less loan-product focused. Education loans page has a 4-step process but no “view offers” or signup step.

---

### 1.3 “Why Choose EpiCred?” — comparison table

| Feature | EpiCred | Others (positioned) |
|---------|---------|---------------------|
| Service charges | Zero | Hidden fees |
| Loan deals | Best options | Limited |
| Scholarship support | Available | Not provided |
| College coverage | Tier-4 colleges | Restricted |
| Approval speed | Fast | Slow |
| Guidance | Personalized | Generic |
| Lender options | Multiple | Limited |

**Our equivalent:** 4-card “Why choose us” (end-to-end, loan expertise, transparency, track record) — no direct competitor comparison table.

---

### 1.4 Destinations (countries)

EpiCred highlights **8 countries** on homepage: Australia, Canada, France, Germany, Ireland, New Zealand, UK, USA.

**Footer SEO hub (per country × 4 page types):**
- `{Country} Education Loan`
- `{Country} Scholarships`
- `Cost of Study in {Country}`
- `Cost of Living in {Country}`

= **32 country-intent landing pages** (8 countries × 4 templates).

**Our equivalent:** 10 country pages (`/countries/[slug]`) with tuition, visa, living cost metadata — **no separate loan/scholarship/cost sub-routes**.

---

### 1.5 Lender partners (public-facing)

EpiCred shows **15+ lenders** on compare tool with live-style data:

| Lender (sample) | Max loan | Interest | Processing time | Processing fee |
|-----------------|----------|----------|-----------------|----------------|
| ICICI Bank | ₹2 Cr | 9.95–12% | 7 days | 0.5–1% |
| IDFC | ₹1.5 Cr | 9.5–13.5% | 10 days | 1% |
| Prodigy Finance | USD 200K | 10.5–14% | 10 days | 5% |
| SBI | ₹1.5 Cr | 10.15–11.15% | 25 days | ₹10,000 |
| Axis, HDFC Credila, BoB, Yes, Tata, Incred, Auxilo, Avanse, Union, Leap, Power Financing | … | … | … | … |

Homepage partner cards show: max loan, coverage %, interest range, approval days + **Apply Now**.

**Our equivalent:** **5 NBFC logos** (Credila, Avanse, Auxilo, InCred, Prodigy) — no rate table, no “Apply Now” per lender, no public comparison.

---

### 1.6 Services catalog

**EpiCred top services (homepage):**
- Abroad Education Loan  
- Domestic Education Loan  
- Education Loan Refinancing  
- US Health Insurance  
- Travel Insurance  

**Extended services (site-wide):**
- GIC (Canada), Block Account (Germany), Forex Card, SIM Card, Credit Card, Bank Account, Flight Tickets, Health Insurance compare, Refinancing

**Our 8 services:**
- Study Abroad Counselling, Education Loans, Visa Assistance, Scholarships, Documentation, Accommodation, Forex, Travel Insurance

**Gap:** We mention forex/insurance but lack **dedicated product pages** for GIC, block account, domestic loan, refinancing, SIM, bank account, flights.

---

### 1.7 Tools hub (major differentiator)

EpiCred groups **20+ free tools**:

#### Loan tools
| Tool | URL path |
|------|----------|
| Compare Loan Offers | `/compare-loan-offers` |
| Interest Calculator | `/interest-calculator` |
| Loan Repayment Calculator | `/loan-repayment-calculator` |
| Education Loan Eligibility Checker | `/education-loan-eligibility-checker` |
| EMI Calculator | `/education-loan-emi-calculator` |
| Bank Comparison Tool | `/bank-comparison-tool` |

#### Academic tools
| Tool | URL path |
|------|----------|
| GPA Calculator | (footer link) |
| SOP Generator | (footer link) |

#### Financial planning
| Tool | Purpose |
|------|---------|
| Cost of Studying Abroad | Country cost overview |
| Living Calculator | Monthly living estimate |
| ROI Calculator | Return on education investment |
| Estimate Future Earnings | Post-grad income projection |

#### Travel & insurance
| Tool | Purpose |
|------|---------|
| Student Packing List | Pre-departure checklist |
| Health Insurance Compare | US/international plans |

#### Utilities
| Tool | Purpose |
|------|---------|
| Currency Converter | FX rates |
| Time Zone Converter | Destination time |
| Weather Abroad | Destination weather |
| Budget Calculator | Total study budget |

**Our equivalent:** **None** — no `/tools` section, no calculators, no eligibility checker.

---

### 1.8 Social proof & content

| Asset | EpiCred | Lakshya |
|-------|---------|---------|
| Success stories | Named students + **loan amount** + university | Success stories page + testimonials (no loan amount emphasis) |
| Google rating | 4.9★ promoted on homepage | Google reviews section exists |
| Blog | Active blog hub | 6 MDX blog posts |
| Webinars | Yes | No |
| Offline events | Yes | No |
| Scholarships DB | Dedicated `/scholarships` search | Scholarships as service page only |
| Founders story | CEO + COO on About | About page (verify founder content) |
| Refer & earn | ₹2,500 per referral | No |

---

### 1.9 Lead capture & conversion

| Feature | EpiCred | Lakshya |
|---------|---------|---------|
| Free counseling form | Name, email, mobile, service select, T&C | Lead form (consultation / loan / contact variants) |
| OTP on booking | Yes (mobile verification) | No OTP on marketing forms |
| WhatsApp QR | FAQ + footer | WhatsApp link via env (`NEXT_PUBLIC_WHATSAPP_NUMBER`) |
| Student signup account | “Sign up on EpiCred” | No public student portal |
| Apply Now (per lender) | Yes | No — leads go to generic form |
| Compare tool gated | Partial table visible; full list after form | N/A |

---

### 1.10 Offices & local trust

EpiCred lists **4 physical offices:**
- Gurugram, Haryana  
- New Delhi  
- Fatehabad, Haryana  
- Chandigarh (Mohali), Punjab  

**Our equivalent:** Office map + contact (single address from env); gallery page.

---

### 1.11 Company & legal

| Page | EpiCred | Lakshya |
|------|---------|---------|
| About | Vision, founders, impact stats | `/about` |
| Careers | Yes | No |
| Refer & Earn | Yes | No |
| Terms & Privacy | Yes | Yes |
| Contact | info@epicred.in, +91 8968839609 | support@lakshyainternationaledwise.com |

---

## 2. What Lakshya already has (strengths)

These are **advantages EpiCred does not expose** on their public site:

| Capability | Details |
|------------|---------|
| **Full CRM** | Students, admissions, partners, applications, lenders, tasks, reports, analytics, audit log |
| **RBAC** | Super Admin → Viewer with granular permissions |
| **Loan pipeline in CRM** | Multi-lender applications, status workflow, commission tracking |
| **Website → CRM leads** | Enquiry forms create admission/student records |
| **White-label** | Company branding, modules, theme via Settings |
| **Premium marketing UI** | Hero, stats, process timeline, banking partners, mapcn office map |
| **SEO foundation** | JSON-LD, sitemap, marketing metadata helper, production domain |
| **Broader consultancy story** | 7-step journey covers visa + travel + career, not loan-only |
| **10 destinations** | Includes Dubai + Europe aggregate (EpiCred shows 8 on hero) |
| **Partner universities section** | Trust signal for admissions-led positioning |

**Positioning opportunity:** Market as *“Consultancy + CRM-backed operations”* — students get human advisors; internally you track everything EpiCred’s marketplace automates only partially.

---

## 3. Side-by-side feature matrix

| Category | EpiCred | Lakshya | Gap severity |
|----------|---------|---------|--------------|
| Loan comparison table (public) | ✅ 15+ lenders | ❌ Logos only | 🔴 Critical |
| EMI / interest calculators | ✅ 6 loan tools | ❌ | 🔴 Critical |
| Eligibility checker | ✅ | ❌ | 🔴 Critical |
| Scholarship search | ✅ Dedicated page | ⚠️ Service copy only | 🔴 Critical |
| Student signup / portal | ✅ | ❌ | 🟠 High |
| Country SEO subpages (×4) | ✅ 32+ pages | ❌ | 🟠 High |
| Tools hub / SEO traffic | ✅ 20+ tools | ❌ | 🟠 High |
| Refer & earn | ✅ | ❌ | 🟡 Medium |
| Webinars / events | ✅ | ❌ | 🟡 Medium |
| Domestic loan page | ✅ | ❌ | 🟡 Medium |
| Refinancing page | ✅ | ❌ | 🟡 Medium |
| GIC / Block account pages | ✅ | ❌ | 🟡 Medium |
| Comparison table (us vs others) | ✅ | ❌ | 🟡 Medium |
| Multi-office listing | ✅ 4 offices | ⚠️ Single office | 🟡 Medium |
| OTP on lead forms | ✅ | ❌ | 🟡 Medium |
| SOP generator / GPA calc | ✅ | ❌ | 🟡 Medium |
| Careers page | ✅ | ❌ | 🟢 Low |
| Full CRM backend | ❌ (not public) | ✅ | ✅ **Our edge** |
| Admissions + visa journey | ⚠️ Secondary | ✅ Primary | ✅ **Our edge** |
| Commission / partner CRM | ❌ | ✅ | ✅ **Our edge** |

---

## 4. Recommended development roadmap

### Phase 1 — Quick wins (2–4 weeks) · Highest ROI

Goal: Match EpiCred’s **loan-first discovery** without building a full marketplace yet.

#### 1.1 Public lender comparison page
- **Route:** `/education-loans/compare` or `/tools/compare-loan-offers`
- **Content:** Table modeled on EpiCred (lender name, max amount, rate range, processing time, fee, collateral yes/no)
- **Data source:** Extend `lib/constants/lenders.ts` + MongoDB `Lender` model fields (`maxLoanAmount`, `interestRateMin`, `interestRateMax`, `processingDays`, `processingFee`, `collateralRequired`)
- **CTA:** “Get personalized quote” → existing `LeadForm` with lender pre-selected
- **CRM tie-in:** Store preferred lender on website lead metadata

#### 1.2 Loan calculators (client-side, no backend)
- **Routes:**
  - `/tools/emi-calculator`
  - `/tools/loan-repayment-calculator`
  - `/tools/interest-calculator`
- **Implementation:** Pure React + shared `lib/utils/loan-calculators.ts` (EMI formula, amortization schedule)
- **SEO:** Each tool gets `generateMetadata`, FAQ schema, internal links from `/education-loans`

#### 1.3 Tools hub landing page
- **Route:** `/tools`
- **Layout:** Card grid grouped like EpiCred (Loan · Academic · Financial · Travel · Utilities)
- **Phase 1 ships:** 3 loan calculators + compare page; other cards marked “Coming soon” or link to blog

#### 1.4 Homepage dual CTA (loan + scholarship)
- Add secondary hero actions: **“Check loan eligibility”** + **“Explore scholarships”**
- Mirror EpiCred’s above-the-fold intent without cloning their exact UI

#### 1.5 “Why choose us” comparison table
- Add section on homepage or `/education-loans`: Lakshya vs typical banks/DIY (zero hidden fees, tier-2/3 support, full journey, CRM-tracked disbursement)

---

### Phase 2 — Lead quality & SEO scale (4–8 weeks)

#### 2.1 Country intent pages (SEO hub)
For each top-8 country, add:
- `/countries/[slug]/education-loan`
- `/countries/[slug]/scholarships`
- `/countries/[slug]/cost-of-study`
- `/countries/[slug]/cost-of-living`

**Implementation:** Extend `app/(marketing)/countries/[slug]/` with nested routes or query-driven tabs; content from MDX/JSON in `content/countries/`.

**Target:** 32 indexable pages (8 × 4) competing with EpiCred footer links.

#### 2.2 Eligibility checker (lead magnet)
- **Route:** `/tools/eligibility-checker`
- **Inputs:** Country, course level, loan amount, co-applicant income, collateral yes/no, CIBIL band (optional)
- **Output:** “Likely eligible with: …” + disclaimer + **Book free counseling** CTA
- **Backend:** Rule engine in `lib/services/loan-eligibility.service.ts` (start with static rules per lender seed)
- **CRM:** Save checker submissions as leads with structured eligibility answers

#### 2.3 Scholarships discovery (MVP)
- **Route:** `/scholarships`
- **MVP:** Filterable list (country, level, amount, deadline) from JSON/CMS — not a live API
- **CTA:** Apply via consultation form
- **Later:** Admin CRUD in CRM for scholarship entries

#### 2.4 Enhanced lender cards on homepage
- Show rate range, max loan, approval days on `BankingPartnersSection` (like EpiCred partner cards)
- “Apply now” → lead form with `lenderId` hidden field

#### 2.5 OTP verification on high-intent forms
- Optional SMS OTP on loan form submit (reuse auth OTP patterns or MSG91/Twilio)
- Reduces fake leads; matches EpiCred counseling flow

---

### Phase 3 — Product platform features (8–16 weeks)

#### 3.1 Student portal (lightweight)
- **Routes:** `/student/login`, `/student/dashboard`
- **Features:** Application status, document checklist, loan status (read-only from CRM), message counselor
- **Auth:** Magic link or OTP to student email/phone
- **Value:** Matches “Sign up on EpiCred” without full self-serve loan marketplace

#### 3.2 Refer & earn program
- **Route:** `/refer`
- **Flow:** Referrer form → unique code → CRM tracks referral on student create
- **Payout:** Manual initially; automate later

#### 3.3 Additional service product pages
Dedicated pages with lead CTAs:
- `/services/domestic-education-loan`
- `/services/refinancing`
- `/services/gic-canada`
- `/services/block-account-germany`
- `/services/health-insurance`
- `/services/forex-card`

#### 3.4 Academic tools
- **SOP Generator:** Guided wizard → downloadable DOCX (AI optional later)
- **GPA calculator:** 4.0 / 10-point / percentage converters

#### 3.5 Financial planning tools
- Cost of studying abroad (per country, reuse country data)
- Living cost calculator
- Budget calculator (tuition + living + travel one-shot)

#### 3.6 Content marketing expansion
- Webinars listing + registration (Zoom/Meet link + CRM lead)
- Events page (offline counseling camps)
- Blog cadence: 2–4 posts/month targeting loan + country keywords

---

### Phase 4 — Operational & competitive moat (ongoing)

| Item | Purpose |
|------|---------|
| Expand lender DB to 15+ | Match EpiCred partner breadth in CRM + marketing |
| Live Google review sync | Auto-pull rating for stats bar (4.9★ style) |
| Multi-office in `MARKETING_OFFICES` | List all branches with map pins |
| Careers page | Hiring trust signal |
| Rate / fee update workflow | Admin UI to refresh public lender table without code deploy |
| A/B test hero CTAs | Loan-first vs consultancy-first messaging |
| WhatsApp Business API | Automated lead ack + document checklist |

---

## 5. Detailed build specs (priority items)

### 5.1 Lender data model extension

Add to `Lender` model / seed:

```typescript
{
  maxLoanAmountInr?: number;
  maxLoanAmountUsd?: number;
  interestRateMin?: number;      // e.g. 9.5
  interestRateMax?: number;      // e.g. 14.25
  processingDaysMin?: number;
  processingDaysMax?: number;
  processingFeeLabel?: string;   // "1%" or "₹10,000"
  collateralRequired?: boolean;
  abroadOnly?: boolean;
  featured?: boolean;
  sortOrder?: number;
}
```

Public compare page reads from DB (cached) with fallback to `LENDER_SEEDS`.

---

### 5.2 EMI calculator spec

**Inputs:** Principal (₹), annual rate (%), tenure (years), moratorium months (optional)  
**Outputs:** Monthly EMI, total interest, total payment, optional year-wise chart  
**Share:** URL query params for shareable results (`?amount=1000000&rate=10&years=10`)

---

### 5.3 Eligibility checker rules (example)

| Rule | Condition | Result |
|------|-----------|--------|
| Prodigy | Admitted to approved university, abroad PG | Likely eligible (no collateral) |
| Credila / Avanse | Co-applicant income ≥ threshold | Likely eligible |
| Collateral route | Property docs available | Expand lender set |

Always show disclaimer: *“Indicative only — final eligibility determined by lender.”*

---

### 5.4 Country subpage content template

Each `{country}/education-loan` page should include:
1. H1: “{Country} Education Loan for Indian Students”
2. Typical loan range + currency
3. Popular lenders for that country
4. Required documents checklist
5. Timeline (apply → sanction → disbursement)
6. FAQ (3–5 questions, JSON-LD)
7. Lead form with `targetCountry` pre-filled
8. Internal links to scholarships + cost pages

---

## 6. SEO keyword gaps (EpiCred ranks for these intents)

| Keyword intent | EpiCred asset | We should build |
|----------------|---------------|-----------------|
| compare education loan | `/compare-loan-offers` | `/tools/compare-loan-offers` |
| education loan EMI calculator | `/education-loan-emi-calculator` | `/tools/emi-calculator` |
| education loan eligibility | `/education-loan-eligibility-checker` | `/tools/eligibility-checker` |
| cost of living in UK | Footer hub | `/countries/uk/cost-of-living` |
| Germany education loan | Footer hub | `/countries/germany/education-loan` |
| scholarships to study abroad | `/scholarships` | `/scholarships` |
| SOP generator free | Academic tools | `/tools/sop-generator` |

---

## 7. What NOT to copy blindly

| EpiCred pattern | Why to adapt, not clone |
|-----------------|-------------------------|
| Marketplace signup before value | Our strength is counselor-led; show partial compare data before form |
| 20 tools at once | Ship 3–5 excellent tools first; avoid thin duplicate calculators |
| Generic AI SOP generator | Quality matters for brand; pair with human review upsell |
| ₹150 Cr / 600+ stats | Use **verified** Lakshya numbers only (we already have stats bar with different metrics) |
| 15 lenders day one | Start with 5 real partners + expand; inaccurate rates hurt trust |

---

## 8. Suggested priority order (if limited dev bandwidth)

1. **EMI calculator** + **Tools hub page** (fast, SEO traffic)  
2. **Lender comparison table** with real data for 5 partners  
3. **Country education-loan subpages** for UK, Canada, USA, Australia (top 4)  
4. **Eligibility checker** (lead capture)  
5. **Scholarships MVP** page  
6. **Homepage loan + scholarship CTAs** + comparison table section  
7. **Student portal** (read-only status)  
8. **Refer & earn**  
9. Remaining utilities (currency, weather, packing list) — low priority  

---

## 9. Files / areas to touch (implementation map)

| Feature | Likely paths |
|---------|----------------|
| Tools routes | `app/(marketing)/tools/` |
| Calculators | `lib/utils/loan-calculators.ts`, `components/marketing/tools/` |
| Lender compare | `components/marketing/sections/lender-comparison-table.tsx`, extend `models/Lender.ts` |
| Country subpages | `app/(marketing)/countries/[slug]/education-loan/page.tsx`, etc. |
| Scholarships | `content/scholarships/*.json`, `app/(marketing)/scholarships/` |
| Navigation | `lib/constants/marketing/navigation.ts` — add Tools, Scholarships |
| Sitemap | `app/sitemap.ts` — register new routes |
| CRM leads | `lib/actions/enquiry.actions.ts` — eligibility + tool submission metadata |
| Admin lender fields | Dashboard lender edit form |

---

## 10. Success metrics (90 days post-Phase 1)

| Metric | Target |
|--------|--------|
| Organic sessions to `/tools/*` | 500+/month |
| Loan form conversion from tools | 5–8% |
| Compare page → lead rate | 10%+ |
| Country subpage impressions | Index 16+ new URLs |
| Avg. time on education-loans page | +40% |
| CRM leads tagged `source: tool` | Trackable segment |

---

## 11. Summary — one paragraph

EpiCred wins the **top-of-funnel loan shopper** with free tools, lender tables, and massive country SEO. Lakshya already wins the **operations and consultancy backend** with CRM, admissions, visa narrative, and partner commissions. To compete head-on for loan search traffic, we should build **Phase 1 tools + public lender comparison** immediately, then **Phase 2 country SEO + eligibility + scholarships** to close the content gap. Long term, a **light student portal** and **referral program** complete the product story without abandoning our human-first consultancy brand.

---

*Sources: [epicred.in](https://epicred.in/), [epicred.in/compare-loan-offers](https://epicred.in/compare-loan-offers), [epicred.in/about-us](https://epicred.in/about-us), Lakshya codebase audit (July 2026).*
