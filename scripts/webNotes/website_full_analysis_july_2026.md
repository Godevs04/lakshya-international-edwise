# Lakshya International Edwise — Full Website Analysis

**Date:** July 4, 2026  
**Scope:** Public marketing site (`app/(marketing)/`), lead capture, SEO, UX, performance, and gaps vs. product vision  
**Related docs:** `lakshya_marketing_website_c9972012.plan.md`, `premium_brand_upgrade_681ce9f2.plan.md`, `epicred-competitor-analysis-and-roadmap.md`, `project-review-bugs-and-suggestions.md`

---

## Executive summary

The marketing site is **production-ready for lead generation** with 13 live routes, a finance-first homepage, eligibility modal funnel, contact/partner forms wired to CRM, 18 lender logos, premium navbar/footer, WhatsApp + call floating widget, and solid SEO infrastructure (metadata, JSON-LD, sitemap, robots).

**Strengths:** Clear positioning as an overseas education **financial partner**, strong visual polish after the premium upgrade, multiple conversion paths, and operational CRM behind every form.

**Main gaps:** Several **built-but-unused components**, **stub legal/content pages**, **no loan comparison tools or blog** (competitors lead here), **thin marketing test coverage**, and **performance risk** from broad client-side motion + heavy lender images. A few **SEO/schema mismatches** and **placeholder content** remain before the site feels fully “international financial institution” grade end-to-end.

---

## What is built and working

### Routes (13 pages)

| Route | Purpose |
|-------|---------|
| `/` | 15-section finance-first homepage |
| `/services`, `/services/[slug]` | 6 services (education loan + 5 ancillary) |
| `/countries`, `/countries/[slug]` | 10 destination loan guides |
| `/lending-partners` | Filterable 18-lender explorer |
| `/become-a-partner` | Partner programme + lead form |
| `/contact` | Contact form, map, office info |
| `/faq` | Searchable FAQ with JSON-LD |
| `/privacy-policy`, `/terms-of-service` | Legal stubs |

### Lead capture (all → CRM / email)

| Funnel | Component | Server action |
|--------|-----------|---------------|
| Check Eligibility (primary) | `eligibility-modal.tsx` | `submitWebsiteEnquiryAction` |
| Contact form | `contact-form.tsx` | `submitWebsiteEnquiryAction` |
| Partner enquiry | `partner-lead-form.tsx` | `submitPartnerEnquiryAction` |
| Auto-prompt (2 min × 3/session) | `inactivity-eligibility-prompt.tsx` | Opens eligibility modal |

### Shell & contact

- **Navbar:** Glass pill nav, mega menus (Services, Countries), partner JOIN badge, scroll compact, mobile drawer with matching animations
- **Footer:** Company / services / countries links, phone, email, WhatsApp, Call buttons, social, trust badges
- **Floating widget:** Bottom-right WhatsApp toggle + call panel (`+91 95021 80806` default)
- **Default contact:** `lib/constants/marketing/contact.ts` + env overrides

### SEO

- Per-page `generateMetadata()` via `lib/seo/marketing-metadata.ts`
- JSON-LD: Organization, WebSite, FAQPage, Service, BreadcrumbList, LocalBusiness, ItemList
- `app/sitemap.ts` — static + all service/country slugs
- `app/robots.ts` — dashboard/api/login blocked
- Tests: `tests/marketing-seo.test.ts`

### Lenders

- 18 lenders with PNG logos in `public/lenders/images/`
- Homepage carousel, hero 3×2 showcase, lending partners page with category filters
- Per-lender eligibility CTA with `preferredLender` tracking

---

## Issues found

### Critical / high

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 1 | **Privacy Policy & Terms are stubs** — 3–4 sentences, not lawyer-reviewed | Legal/compliance risk for a finance brand | `privacy-policy/page.tsx`, `terms-of-service/page.tsx` |
| 2 | **SearchAction JSON-LD points to `/services?q=` but no search UI exists** | Misleading structured data; possible Google rich-result issues | `page.tsx` + `json-ld.tsx` `websiteJsonLd` |
| 3 | **Google Maps embed placeholder in `.env.example`** (`YOUR_EMBED_CODE`) | Contact page map may not render until real embed URL is set | `.env.example`, `office-location-showcase.tsx` |
| 4 | **Office data is generic** — addresses are “India” only; gallery placeholders | Weak trust signal on About/Contact | `lib/constants/marketing/offices.ts`, `about-journey-section.tsx` |
| 5 | **Production MongoDB credentials in Git history** (if repo was ever public) | Security — rotate credentials | See `project-review-bugs-and-suggestions.md` |

### Medium

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 6 | **7 unused marketing components** — code drift, maintenance cost | Wasted build surface | See “Dead code” section below |
| 7 | **No marketing E2E or component tests** — only SEO + form schema tests | Regressions in navbar, modal, carousel undetected | `tests/` |
| 8 | **Heavy client JS** — ~29 `"use client"` files in marketing; no `next/dynamic` lazy loading | Slower mobile TTI, higher bundle | `components/marketing/**` |
| 9 | **Lender carousel duplicates full list** (36 DOM nodes) + `quality={100}` on all logos | Unnecessary paint/bandwidth | `lender-logo-carousel.tsx`, `lender-logo.tsx` |
| 10 | **Banner assets unused** — `assets/banners/Marketing_1–3.png` not integrated | Missed hero/marketing creative opportunity | `assets/banners/` |
| 11 | **About Us is homepage anchor only** (`/#about`) — no dedicated `/about` page | Weaker SEO for brand queries; nav hash links never show “active” | `navigation.ts` |
| 12 | **Testimonials lack video URLs** — play button shows “coming soon” | Social proof feels incomplete | `testimonial-card.tsx`, testimonial data |
| 13 | **Env vars used but not in `.env.example`** | Onboarding friction | `APP_COMPANY_LOGO`, `APP_EMAIL_BANNER_URL`, `NEXT_PUBLIC_APP_URL` |

### Low / polish

| # | Issue | Impact |
|---|-------|--------|
| 14 | Lender tooltips are hover-only — no tap equivalent on mobile | Minor UX gap |
| 15 | `LeadForm` supports multiple enquiry types but is not mounted anywhere | Dead code |
| 16 | Trust metrics (₹500+ Cr, 20,000+ students) are static — no source/footnote | Credibility question for savvy users |
| 17 | FAQ homepage shows 6 items; full list on `/faq` — good, but no FAQ category filters | Minor discoverability |
| 18 | Staff Login in navbar goes to CRM `/login` — may confuse students | Consider label “Partner Portal” for B2B clarity |

---

## Dead code / built but unused

These components exist and compile but are **not imported by any page**:

| Component | File | Original intent |
|-----------|------|-----------------|
| `LeadForm` | `forms/lead-form.tsx` | Consultation / multi-variant enquiry |
| `GoogleReviewsSection` | `sections/google-reviews.tsx` | Google review cards |
| `GalleryGrid` | `gallery/gallery-grid.tsx` | Office/event gallery |
| `OfficeHighlightsSection` | `sections/office-highlights.tsx` | Office showcase |
| `StatsBar` | `sections/stats-bar.tsx` | Numeric stats strip |
| `WhyChooseSection` | `sections/why-choose.tsx` | 4-card why-us grid |
| `ProcessTimelineSection` | `sections/process-timeline.tsx` | Vertical journey (homepage uses `FinanceProcessHorizontal` instead) |

**Recommendation:** Either wire into pages (gallery on About, Google reviews on homepage) or delete to reduce bundle confusion.

---

## Improvements (UX & design)

### Quick wins (1–3 days)

1. **Replace legal stubs** with proper Privacy Policy + Terms (loan data, lender sharing, consent, retention).
2. **Fix SearchAction** — point to `/faq` with client-side FAQ search, or remove `potentialAction` until site search exists.
3. **Real office addresses** in `MARKETING_OFFICES` + Google Maps embed for Chennai/Hyderabad/Bangalore.
4. **Integrate `GoogleReviewsSection`** on homepage or contact page with real Google Place ID / review API or static curated reviews.
5. **Use banner assets** (`Marketing_1–3.png`) in hero alternate layouts or CTA banner A/B variants.
6. **Add `/about` page** — move `AboutJourneySection` content + office gallery; keep `/#about` as redirect.
7. **Wire `GalleryGrid`** with 6–12 office/student event photos (Cloudinary or `public/`).

### UX enhancements

| Area | Suggestion |
|------|------------|
| Navbar | On tablet (`md`–`lg`), center nav is hidden but right actions show — consider condensed nav or “Menu” earlier |
| Eligibility modal | Add progress indicator (“Step 1 of 2”), lender pre-select confirmation when opened from carousel |
| Lending partners | Add sort by ROI / max amount / collateral type (filter exists; sort would help comparison) |
| Country pages | Add “Estimated loan range” calculator stub per country |
| Contact | Show response-time promise (“We reply within 2 hours on WhatsApp”) |
| Footer | Add RBI/NBFC partner disclaimer if applicable |

### Accessibility

- Focus states are present on navbar and forms — good
- Verify colour contrast on `text-secondary/80` nav items against glass background (WCAG AA)
- Add `skip to main content` link in marketing layout
- Ensure eligibility modal traps focus and returns focus on close

---

## Feature recommendations

### Tier 1 — High business value (competitive parity)

From `epicred-competitor-analysis-and-roadmap.md`:

| Feature | Why | Effort |
|---------|-----|--------|
| **EMI / loan eligibility calculator** | Self-serve tool; increases time-on-site + leads | Medium |
| **Lender comparison table** | Side-by-side ROI, max amount, collateral, processing time | Medium |
| **Country SEO hub expansion** | Long-tail pages: “education loan for MS in USA”, etc. | Medium (content) |
| **Scholarship / funding finder (lite)** | EpiCred’s hero differentiator — even a curated list helps | Medium |
| **Student success stories page** | `/success-stories` with outcomes + loan amounts | Low–medium |
| **WhatsApp click tracking** | PostHog/Meta events on floating widget + footer WA links | Low |

### Tier 2 — Growth & retention

| Feature | Why | Effort |
|---------|-----|--------|
| **Blog / resources (MDX)** | SEO + authority; planned in original marketing plan | Medium |
| **Document checklist PDF** | Lead magnet after eligibility submit | Low |
| **Referral programme page** | Student refer-a-friend incentives | Low |
| **Partner portal marketing landing** | Separate from “Become a Partner” for existing partners | Low |
| **Live chat (Intercom/Crisp)** or **WhatsApp Business API** | Automated ack + document checklist | Medium |

### Tier 3 — Platform / CRM integration

| Feature | Why | Effort |
|---------|-----|--------|
| **Application status lookup** | Student portal lite (phone + OTP → status) | High |
| **Lender rate API sync** | Dynamic ROI on lender cards | High |
| **Multi-language (Tamil/Hindi)** | Regional audience expansion | High |

---

## Performance analysis

| Concern | Detail | Fix |
|---------|--------|-----|
| Client bundle | Layout wraps entire site in `EligibilityModalProvider` (client boundary) | Acceptable; consider lazy-loading modal chunk |
| Framer Motion | Navbar, hero, carousel, counters, journey path, modals | `next/dynamic` for below-fold sections |
| Lender images | 17+ PNGs at `quality={100}` | Use `quality={85}`, WebP via Cloudinary, or SVG where possible |
| Carousel | Doubled lender array for infinite scroll | CSS `animation` on transformed track vs duplicating DOM |
| Journey path | Fixed full-viewport SVG + IntersectionObserver on all nodes | Disable on mobile low-end via `matchMedia` or reduce opacity (partially done) |
| Third-party | Google Maps iframe on contact | Lazy-load iframe when section enters viewport |

**Suggested targets:** LCP < 2.5s, CLS < 0.1, mobile Performance score > 85 (Lighthouse).

---

## SEO & content gaps

| Item | Status | Action |
|------|--------|--------|
| Canonical URLs | ✅ Centralized | Keep using `buildMarketingMetadata` |
| OG image | ✅ `/logo_model.jpeg` | Consider dedicated 1200×630 marketing OG image |
| Google Search Console | ⚠️ Env key exists | Verify domain property post-deploy |
| Structured data | ⚠️ SearchAction mismatch | Fix or remove |
| Internal linking | ✅ Good cross-links | Add blog when ready |
| Local SEO | ⚠️ Generic address | Real addresses + LocalBusiness per office |
| Content depth | ⚠️ Service/country pages are template-driven | Add unique copy per lender/country |
| Backlinks / off-page | N/A in code | Content marketing + partner listings |

---

## Testing gaps

| Area | Current tests | Missing |
|------|---------------|---------|
| SEO metadata | `marketing-seo.test.ts` | JSON-LD output snapshots |
| Form validation | `finance-forms.test.ts` | — |
| Google Maps parse | `google-maps-embed.test.ts` | — |
| Navbar / mega menu | — | Interaction, a11y |
| Eligibility modal | — | Submit flow, honeypot |
| Contact / partner forms | — | Integration with mocked actions |
| Lender carousel | — | Click → modal with preferredLender |
| Responsive snapshots | — | Playwright visual regression |
| `getMarketingContact()` | — | Default phone/WhatsApp fallbacks |

---

## Environment & configuration

### Required for full marketing experience

```env
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_CONTACT_PHONE=+91 95021 80806
NEXT_PUBLIC_WHATSAPP_NUMBER=919502180806
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL=   # real embed, not placeholder
WEBSITE_ENQUIRY_NOTIFY_EMAIL=
```

### Recommended additions to `.env.example`

- `APP_COMPANY_LOGO`
- `APP_EMAIL_BANNER_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GOOGLE_PLACE_ID` (if adding live reviews)

### Defaults

Phone/WhatsApp fall back to `+91 95021 80806` via `lib/constants/marketing/contact.ts` when env is unset.

---

## CRM & ops (cross-cutting)

These affect the website experience but live outside `app/(marketing)/`:

| Item | Notes |
|------|-------|
| Enquiry → Student record | Working via `enquiry.actions.ts` |
| Partner enquiry | Email + activity log only |
| Rate limiting | In-memory without `REDIS_URL` — use Redis in production |
| Email notifications | Requires SMTP; graceful degrade if unset |
| Sentry | Optional; recommended for production form errors |

---

## Prioritized action plan

### P0 — Before major marketing push

- [ ] Legal pages (Privacy, Terms) — lawyer-reviewed
- [ ] Real office addresses + working Google Maps embed
- [ ] Fix or remove SearchAction JSON-LD
- [ ] Confirm production env: phone, WhatsApp, SMTP, `REDIS_URL`, `CRON_SECRET`
- [ ] Lighthouse mobile audit on homepage + `/contact`

### P1 — Conversion & trust (2–4 weeks)

- [ ] EMI / eligibility calculator (simple)
- [ ] Lender comparison table on `/lending-partners`
- [ ] Google reviews section on homepage
- [ ] Success stories page
- [ ] Wire or remove dead components
- [ ] Integrate banner creative assets
- [ ] Add `/about` dedicated page

### P2 — SEO & content (1–2 months)

- [ ] Blog/resources (MDX)
- [ ] Country long-tail content expansion
- [ ] Scholarship/funding curated page
- [ ] Video testimonials with real URLs
- [ ] Office gallery (Cloudinary)

### P3 — Platform differentiation

- [ ] Student application status lookup
- [ ] WhatsApp Business API automation
- [ ] Dynamic lender rates
- [ ] Regional language support

---

## Homepage section map (reference)

```
HomepageJourneyPath → FinanceHero → TrustMetricsBar → LenderLogoCarousel
→ FinanceServicesGrid → FinanceProcessHorizontal → LakshyaRootMap
→ ValuePropsGrid (accepts) → ValuePropsGrid (gives back) → Countries preview
→ LendingPartnersPreview → AboutJourneySection (#about) → Testimonials
→ FaqSection (6) → CtaBanner
```

---

## Conclusion

The site successfully positions Lakshya as a **premium education finance partner** with strong visual design, multiple lead funnels, and lender credibility. The biggest opportunities are **content depth** (legal, offices, reviews, stories), **self-serve loan tools** (calculator, comparison), and **performance hardening** on mobile.

Addressing P0 items and Tier 1 features would close the gap with competitors like EpiCred while preserving Lakshya’s advantage: **human consultancy + production CRM** behind every enquiry.

---

*Generated from codebase analysis — July 4, 2026. Re-run after major releases.*
