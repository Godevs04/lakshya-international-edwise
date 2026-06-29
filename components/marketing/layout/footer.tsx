import Link from "next/link";
import { MARKETING_FOOTER_LINKS } from "@/lib/constants/marketing/navigation";
import { getMarketingContact, getWhatsAppLink } from "@/lib/config/marketing";
import { AppLogo } from "@/components/brand/app-logo";
import { Mail, Phone, MapPin } from "lucide-react";

export function MarketingFooter() {
  const contact = getMarketingContact();
  const whatsapp = getWhatsAppLink("Hello, I would like to enquire about study abroad counselling.");

  return (
    <footer className="border-t border-border bg-secondary text-white">
      <div className="container mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <AppLogo alt={contact.companyName} variant="mobile" surface="dark" />
          <p className="text-sm leading-relaxed text-white/70">
            Premium study abroad counselling and education loan assistance for ambitious students.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-300">Company</h3>
          <ul className="space-y-2 text-sm text-white/75">
            {MARKETING_FOOTER_LINKS.company.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-300">Services</h3>
          <ul className="space-y-2 text-sm text-white/75">
            {MARKETING_FOOTER_LINKS.services.slice(0, 6).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-300">Contact</h3>
          <ul className="space-y-3 text-sm text-white/75">
            {contact.phone && (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`tel:${contact.phone}`} className="hover:text-white">
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.email && (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noreferrer" className="hover:text-white">
                  WhatsApp Chat
                </a>
              </li>
            )}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>India</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-white/60 md:flex-row">
          <p>
            Copyright {new Date().getFullYear()} {contact.companyName}. All rights reserved.
          </p>
          <div className="flex gap-4">
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
