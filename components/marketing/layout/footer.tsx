import Link from "next/link";
import { MARKETING_FOOTER_LINKS } from "@/lib/constants/marketing/navigation";
import { getMarketingContact, getWhatsAppLink } from "@/lib/config/marketing";
import { MARKETING_OFFICES } from "@/lib/constants/marketing/offices";
import { AppLogo } from "@/components/brand/app-logo";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { Mail, Phone, MapPin, Clock, Share2, ExternalLink, Star, MessageCircle } from "lucide-react";
import { MARKETING_OFFICE_HOURS } from "@/lib/constants/marketing/offices";
import { toMarketingTelHref } from "@/lib/constants/marketing/contact";

export function MarketingFooter() {
  const contact = getMarketingContact();
  const whatsapp = getWhatsAppLink("Hello, I would like to check my education loan eligibility.");
  const primaryOffice = MARKETING_OFFICES[0];
  const telHref = contact.phone ? toMarketingTelHref(contact.phone) : null;

  const socialLinks = [
    { href: contact.social.facebook, label: "Facebook" },
    { href: contact.social.instagram, label: "Instagram" },
    { href: contact.social.linkedin, label: "LinkedIn" },
    { href: contact.social.youtube, label: "YouTube" },
  ].filter((entry) => entry.href);

  return (
    <footer className="relative overflow-hidden border-t border-border bg-secondary text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400' fill='none'%3E%3Cellipse cx='400' cy='200' rx='360' ry='160' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="container relative mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-2">
            <AppLogo alt={contact.companyName} variant="mobile" surface="dark" />
            <p className="text-sm font-semibold text-white">{contact.companyName}</p>
            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              Lakshya International Edwise is your trusted overseas education financial partner —
              education loans from 20+ lenders for USA, UK, Canada, Ireland, Germany, Australia, and
              UAE/Dubai, with fast approvals and transparent guidance.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(({ href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/70 transition-all duration-200 hover:scale-105 hover:border-white/40 hover:text-white"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {label}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                ))}
              </div>
            )}
            <EligibilityCta source="footer" className="px-5 py-2.5 text-sm" />
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-300">Company</h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              {MARKETING_FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-300">Services</h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              {MARKETING_FOOTER_LINKS.services.slice(0, 6).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-300">Countries</h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              {MARKETING_FOOTER_LINKS.countries.slice(0, 6).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-300">Contact</h3>
            <ul className="space-y-3 text-sm text-white/75">
              {contact.phone && telHref && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                  <a href={telHref} className="hover:text-white">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                  <a href={`mailto:${contact.email}`} className="hover:text-white">
                    {contact.email}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                <span>{MARKETING_OFFICE_HOURS}</span>
              </li>
              {whatsapp && contact.phone && (
                <li className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                  <a href={whatsapp} target="_blank" rel="noreferrer" className="hover:text-white">
                    {contact.phone}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                <span>{primaryOffice?.name ?? "India"} — {primaryOffice?.address ?? "India"}</span>
              </li>
            </ul>

            {(telHref || whatsapp) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {telHref && (
                  <a
                    href={telHref}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden />
                    Call
                  </a>
                )}
                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                    WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            4.9 Google Rating
          </span>
          <span className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
            20+ Lending Partners
          </span>
          <span className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
            20,000+ Students Funded
          </span>
          <span className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
            ROI From 8.25%
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/60 md:flex-row">
          <p>
            Copyright {new Date().getFullYear()} {contact.companyName}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {MARKETING_FOOTER_LINKS.legal.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
