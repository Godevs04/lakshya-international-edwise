import Image from "next/image";
import Link from "next/link";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MARKETING_LENDERS } from "@/lib/constants/marketing/lenders";

export function BankingPartnersSection() {
  return (
    <SectionShell
      variant="tint"
      eyebrow="Education Loans"
      title="Partner with leading education loan providers"
      description="Compare lenders, understand eligibility, and track sanction to disbursement with expert support."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {MARKETING_LENDERS.map((lender) => (
          <div
            key={lender.slug}
            className="card-premium flex items-center justify-center rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
          >
            <Image
              src={lender.logo}
              alt={lender.name}
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/education-loans" className="text-sm font-semibold text-primary hover:underline">
          Explore education loan services
        </Link>
      </div>
    </SectionShell>
  );
}
