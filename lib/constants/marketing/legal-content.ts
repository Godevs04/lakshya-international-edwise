export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    paragraphs: [
      "Lakshya International Edwise (\"we\", \"us\", or \"our\") operates lakshyainternationaledwise.com and related digital channels. This Privacy Policy explains how we collect, use, store, and protect personal information when you enquire about overseas education loans, ancillary student services, or partner programmes.",
      "By submitting a form, contacting us, or using our website, you consent to the practices described in this policy. If you do not agree, please do not use our services.",
    ],
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    paragraphs: ["We may collect the following categories of information:"],
    bullets: [
      "Identity and contact details: name, phone number, email address, and city",
      "Education and loan profile: target country, course, university, loan amount, and academic background",
      "Financial indicators shared for eligibility: income range, collateral availability, and CIBIL-related disclosures you provide voluntarily",
      "Communication records: messages, call notes, and WhatsApp interactions related to your enquiry",
      "Technical data: IP address, browser type, device information, and pages visited (via standard analytics cookies where enabled)",
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    paragraphs: ["We use personal information solely for legitimate business purposes, including:"],
    bullets: [
      "Assessing education loan eligibility and recommending suitable lenders",
      "Coordinating applications with banks, NBFCs, and international lending partners",
      "Providing counselling on forex, accommodation, blocked accounts, and related student services you request",
      "Responding to enquiries and sending service-related updates",
      "Improving our website, compliance processes, and customer experience",
      "Meeting legal, regulatory, and audit obligations applicable to financial intermediation",
    ],
  },
  {
    id: "sharing",
    title: "Sharing With Lenders and Partners",
    paragraphs: [
      "To process your education loan application, we share relevant information with lending institutions and authorised partners only with your knowledge and consent. This may include banks, NBFCs, international lenders, university representatives, and compliance vendors.",
      "We do not sell personal data to third parties for marketing purposes. Data is shared on a need-to-know basis for application processing, disbursement support, and services you explicitly request.",
    ],
  },
  {
    id: "retention",
    title: "Data Retention",
    paragraphs: [
      "We retain enquiry and application records for as long as necessary to fulfil the services requested, comply with applicable law, resolve disputes, and maintain business records. Typical retention for active loan enquiries is up to seven years from last meaningful contact unless a longer period is required by regulation or lender agreements.",
      "You may request deletion of marketing communications or correction of inaccurate data subject to legal and contractual constraints.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "We implement administrative, technical, and organisational safeguards including encrypted transmission, access controls, and secure hosting practices. No method of transmission over the internet is completely secure; we continuously work to protect information in our custody.",
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights",
    paragraphs: ["Depending on applicable law, you may have the right to:"],
    bullets: [
      "Access personal data we hold about you",
      "Request correction of inaccurate information",
      "Withdraw consent for non-essential communications",
      "Lodge a complaint with a relevant data protection authority",
    ],
  },
  {
    id: "contact",
    title: "Contact Us",
    paragraphs: [
      "For privacy requests or questions about this policy, contact us via the details on our Contact page or email support@lakshyainternationaledwise.com.",
      "This policy was last updated in July 2026 and may be revised periodically. Material changes will be reflected on this page.",
    ],
  },
];

export const TERMS_OF_SERVICE_SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to Terms",
    paragraphs: [
      "These Terms of Service govern your use of the Lakshya International Edwise website and enquiry services. By accessing our site or submitting information, you agree to these terms.",
    ],
  },
  {
    id: "services",
    title: "Nature of Services",
    paragraphs: [
      "Lakshya International Edwise provides education loan advisory, lender comparison, and ancillary student finance guidance. We act as an intermediary connecting students and families with lending partners; we are not a bank or NBFC unless explicitly stated.",
      "Our services include eligibility assessment, document guidance, lender coordination, and support for related products such as forex transfers and blocked accounts where offered.",
    ],
  },
  {
    id: "no-guarantee",
    title: "No Guarantee of Outcomes",
    paragraphs: [
      "Loan sanction, interest rate, disbursement timeline, visa approval, and university admission decisions are made solely by lenders, embassies, and institutions. We provide professional guidance but cannot guarantee approval, specific ROI, or processing times.",
      "Illustrative rates, amounts, and timelines on our website are indicative and subject to lender policy, credit assessment, and regulatory requirements at the time of application.",
    ],
  },
  {
    id: "fees",
    title: "Fees and Charges",
    paragraphs: [
      "Student counselling and loan comparison through Lakshya International Edwise is provided without service charges to students unless otherwise communicated in writing for a specific premium service.",
      "Lenders may levy processing fees, insurance premiums, or other charges per their schedules. We disclose partner fee structures transparently during the application process.",
    ],
  },
  {
    id: "user-responsibilities",
    title: "Your Responsibilities",
    paragraphs: ["When using our services, you agree to:"],
    bullets: [
      "Provide accurate and complete information in all forms and conversations",
      "Submit genuine documents and not misrepresent financial or academic status",
      "Respond promptly to requests needed for lender processing",
      "Use the website lawfully and not attempt unauthorised access to our systems",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    paragraphs: [
      "All content on this website — including text, branding, layouts, and proprietary tools — is owned by Lakshya International Edwise or licensed to us. You may not copy, redistribute, or commercially exploit materials without written permission.",
    ],
  },
  {
    id: "limitation",
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, Lakshya International Edwise is not liable for indirect, incidental, or consequential damages arising from use of the website or reliance on indicative information. Our liability for direct damages is limited to fees paid to us for the specific service giving rise to the claim, if any.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing Law and Updates",
    paragraphs: [
      "These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu, unless otherwise required by mandatory consumer protection law.",
      "We may update these terms periodically. Continued use after changes constitutes acceptance. Last updated: July 2026.",
    ],
  },
];
