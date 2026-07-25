import { MarketingIcon } from "@/lib/constants/marketing/icons";
import type { ValueProp } from "@/lib/constants/marketing/lakshya-value-props";

interface CountryLoanHowItWorksProps {
  countryName: string;
  steps: ValueProp[];
}

export function CountryLoanHowItWorks({ countryName, steps }: CountryLoanHowItWorksProps) {
  return (
    <section className="country-loan-how" aria-labelledby="country-loan-how-title">
      <div className="country-loan-how-head">
        <p className="country-loan-how-eyebrow">How it works</p>
        <h2 id="country-loan-how-title">Your {countryName} education loan journey</h2>
        <p>
          Documents checklist, ROI guidance, processing fee support, and sanction follow the same
          clear path — tailored to your {countryName} admit.
        </p>
      </div>
      <ol className="country-loan-how-steps">
        {steps.map((step, index) => (
          <li key={step.title} className="country-loan-how-step">
            <span className="country-loan-how-index" aria-hidden>
              {index + 1}
            </span>
            <span className="country-loan-how-icon" aria-hidden>
              <MarketingIcon name={step.icon} className="h-5 w-5" />
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
