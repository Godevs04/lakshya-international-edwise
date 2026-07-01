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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {MARKETING_LENDERS.map((lender) => (
          <div
            key={lender.slug}
            className="card-premium flex min-h-24 items-center justify-center rounded-2xl bg-white px-5 py-4 transition-transform hover:-translate-y-0.5 sm:min-h-28"
          >
            <Image
              src={lender.logo}
              alt={`${lender.name} education loan partner logo`}
              width={lender.logoWidth}
              height={lender.logoHeight}
              className="max-h-14 w-auto max-w-full object-contain sm:max-h-16"
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 160px"
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
