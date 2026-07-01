import Link from "next/link";
import { MARKETING_FOOTER_LINKS } from "@/lib/constants/marketing/navigation";
import { getMarketingContact, getWhatsAppLink } from "@/lib/config/marketing";
import { AppLogo } from "@/components/brand/app-logo";
import { Mail, Phone, MapPin, Clock, Share2, ExternalLink } from "lucide-react";
import { MARKETING_OFFICE_HOURS } from "@/lib/constants/marketing/offices";

export function MarketingFooter() {
  const contact = getMarketingContact();
  const whatsapp = getWhatsAppLink("Hello, I would like to enquire about study abroad counselling.");

  const socialLinks = [
    { href: contact.social.facebook, label: "Facebook" },
    { href: contact.social.instagram, label: "Instagram" },
    { href: contact.social.linkedin, label: "LinkedIn" },
    { href: contact.social.youtube, label: "YouTube" },
  ].filter((entry) => entry.href);

  return (
    <footer className="border-t border-border bg-secondary text-white">
      <div className="container mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-2">
            <AppLogo alt={contact.companyName} variant="mobile" surface="dark" />
            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              Premium study abroad counselling and education loan assistance for ambitious students and families.
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
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/40 hover:text-white"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {label}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                ))}
              </div>
            )}
            <Link href="/contact" className="btn-marketing inline-block rounded-full px-5 py-2.5 text-sm font-semibold">
              Book Free Consultation
            </Link>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">Company</h3>
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
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">Services</h3>
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
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">Countries</h3>
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
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">Contact</h3>
            <ul className="space-y-3 text-sm text-white/75">
              {contact.phone && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <a href={`tel:${contact.phone}`} className="hover:text-white">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <a href={`mailto:${contact.email}`} className="hover:text-white">
                    {contact.email}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>{MARKETING_OFFICE_HOURS}</span>
              </li>
              {whatsapp && (
                <li>
                  <a href={whatsapp} target="_blank" rel="noreferrer" className="font-medium text-emerald-300 hover:text-white">
                    WhatsApp Chat
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-white/10 pt-8">
          <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
            ISO Certified
          </span>
          <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
            12+ Years Experience
          </span>
          <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
            320+ University Partners
          </span>
        </div>
      </div>

      <div className="border-t border-white/10">
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
