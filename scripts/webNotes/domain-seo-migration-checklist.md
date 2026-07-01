# Domain & SEO Migration Checklist

**Primary domain:** `https://lakshyainternationaledwise.com`  
**Support email:** `support@lakshyainternationaledwise.com`

Use this checklist after deploying the code changes.

---

## 1. DNS and hosting

- [ ] Point `lakshyainternationaledwise.com` A/CNAME records to your host (Fly, Render, VPS, etc.)
- [ ] Add `www` CNAME → verify it redirects to apex (`www` → non-www is configured in `next.config.ts`)
- [ ] Confirm HTTPS certificate is active on the apex domain

## 2. Production environment variables

Set on your hosting platform or production `.env.local`:

| Variable | Value |
|----------|-------|
| `AUTH_URL` | `https://lakshyainternationaledwise.com` |
| `NEXTAUTH_URL` | `https://lakshyainternationaledwise.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://lakshyainternationaledwise.com` |
| `APP_COMPANY_EMAIL` | `support@lakshyainternationaledwise.com` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `support@lakshyainternationaledwise.com` |
| `WEBSITE_ENQUIRY_NOTIFY_EMAIL` | `support@lakshyainternationaledwise.com` |
| `SMTP_FROM` | `Lakshya International Edwise <support@lakshyainternationaledwise.com>` |

After deploy, run `npm run seed` or update **Settings → Company** in the CRM if the stored email is still old.

## 3. Email deliverability

- [ ] Create `support@lakshyainternationaledwise.com` mailbox
- [ ] Configure SPF, DKIM, and DMARC DNS records for the domain
- [ ] Send a test password-reset / enquiry notification email and confirm links use the new domain

## 4. Google Search Console

- [ ] Add property: `https://lakshyainternationaledwise.com`
- [ ] Verify via `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var (meta tag) or DNS
- [ ] Submit sitemap: `https://lakshyainternationaledwise.com/sitemap.xml`
- [ ] Request indexing for homepage and key pages (`/services`, `/countries`, `/contact`)
- [ ] Monitor **Coverage** and **Core Web Vitals** reports

## 5. Google Business Profile

- [ ] Update website URL to `https://lakshyainternationaledwise.com`
- [ ] Ensure business name, phone, and address match the website footer/contact page (NAP consistency)

## 6. Bing Webmaster Tools (optional)

- [ ] Add site and submit sitemap

## 7. Old domain (`lie.teamgodevs.in`)

No automatic 301 redirect is configured (per project decision). If the old domain was indexed:

- [ ] Remove or de-prioritize the old property in Search Console
- [ ] Update backlinks, social profiles, and printed materials to the new URL

## 8. Post-launch verification

- [ ] Homepage shows correct canonical URL in page source
- [ ] `/robots.txt` references new sitemap URL
- [ ] Open Graph debugger (LinkedIn/Facebook) shows correct title, image, and URL
- [ ] CRM login and password-reset emails link to `lakshyainternationaledwise.com`
- [ ] Website contact form sends notifications to `support@lakshyainternationaledwise.com`

---

*Technical SEO in the codebase improves crawlability and rich results; ongoing rankings also depend on content, reviews, and authoritative backlinks.*
