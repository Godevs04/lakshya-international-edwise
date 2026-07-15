import type { MarketingFaq } from "@/types/marketing";

export const MARKETING_FAQS: MarketingFaq[] = [
  {
    category: "Eligibility",
    question: "Can I get an education loan with a low CIBIL score?",
    answer: [
      "Yes. A low CIBIL score does not automatically mean your education loan application will be rejected. At Lakshya International Edwise, we carefully evaluate the reason behind the low score. If the delayed payments (DPDs) have a genuine explanation and your repayment intent is satisfactory, there is a strong possibility of securing an education loan.",
      "Our team will help you prepare the required documents, including NOCs (No Objection Certificates) and a proper explanation for your credit history. We also guide you on improving your credit profile and identify lenders who are more suitable for your case.",
    ].join("\n\n"),
  },
  {
    category: "Eligibility",
    question: "I have an educational gap in my profile. Can I still get an education loan?",
    answer: [
      "Absolutely. An educational gap is not always a barrier to obtaining an education loan. While some lenders may consider it during the evaluation process, a well-documented and genuine reason for the gap can significantly improve your chances of approval.",
      "At Lakshya International Edwise, our experts assist you in presenting the right supporting documents and explanation to the lender, helping you overcome this concern and maximize your chances of loan approval.",
    ].join("\n\n"),
  },
  {
    category: "Coverage",
    question: "What expenses are covered under an education loan?",
    answer: [
      "An education loan is designed to cover much more than just your tuition fees. Depending on the lender and loan scheme, it can include:",
      [
        "University or tuition fees",
        "Living and accommodation expenses",
        "Travel expenses",
        "Visa charges",
        "Health and travel insurance",
        "Books, laptop, and study materials",
        "Examination and other academic-related expenses",
      ]
        .map((item) => `• ${item}`)
        .join("\n"),
      "Our team helps you understand the complete list of eligible expenses and ensures you receive the maximum funding available based on your admission and lender guidelines.",
    ].join("\n\n"),
  },
  {
    category: "Repayment",
    question: "How do I repay my education loan?",
    answer: [
      "Education loans offer flexible repayment options to suit different financial situations. The most common repayment methods are:",
      [
        "PSI (Partial Simple Interest): During the moratorium period (course duration plus the lender's approved grace period), you pay only the partial interest. After the moratorium ends, your regular EMI begins.",
        "SSI (Simple Interest): You pay the full simple interest throughout the moratorium period, which helps reduce your future EMI burden.",
        "Direct EMI: You start paying the full EMI immediately after the loan is disbursed.",
      ]
        .map((item) => `• ${item}`)
        .join("\n"),
      "Our experts will help you understand each repayment option and choose the one that best fits your financial goals.",
    ].join("\n\n"),
  },
  {
    category: "Repayment",
    question: "Can I repay my education loan early? Are there any prepayment charges?",
    answer: [
      "Yes. Most education loans allow you to make part-payments or repay the loan in full after the loan has been disbursed. In many cases, lenders do not charge any prepayment or foreclosure fees, allowing you to close your loan early and save on interest costs.",
      "At Lakshya International Edwise, our team will guide you through the repayment process, explain the lender's prepayment policies, and help you choose the most cost-effective repayment strategy.",
    ].join("\n\n"),
  },
  {
    category: "Documents",
    question: "What documents are required for an education loan?",
    answer: [
      "We're preparing a complete documents checklist tailored for students and co-applicants.",
      "Requirements typically depend on your destination, university, lender type, and whether the loan is collateral, non-collateral, or non-co-signer. Share your profile with us and our advisors will send you a customized checklist covering student KYC, academic records, admission offer, and financial documents.",
      "A full checklist will be published here shortly.",
    ].join("\n\n"),
  },
  {
    category: "Why Loan",
    question: "Why is taking an education loan for studying abroad important?",
    answer: [
      "An education loan is more than just financial assistance — it's an investment in your future. It allows students to pursue their dream university without placing a heavy financial burden on their families.",
      "Some of the key benefits include:",
      [
        "No financial stress on parents: Your family doesn't have to arrange a large amount of money at once.",
        "Secure your admission on time: Avoid losing your university seat due to a lack of funds.",
        "Complete funding: Education loans can cover tuition fees, living expenses, travel, insurance, visa charges, and other academic expenses.",
        "Preserve family savings: Your family's savings and investments remain available for emergencies or other financial goals.",
        "Flexible repayment: Most lenders provide a moratorium period, allowing you to start major repayments only after completing your course.",
        "Build your credit history: Timely loan repayments help establish a strong credit profile for future financial needs.",
        "Focus on your studies: Instead of worrying about finances, you can concentrate on achieving your academic and career goals.",
      ]
        .map((item) => `• ${item}`)
        .join("\n"),
      "At Lakshya International Edwise, we help students choose the right loan option with the best interest rates and repayment plans.",
    ].join("\n\n"),
  },
  {
    category: "Lenders",
    question: "Can I apply with multiple lenders at the same time?",
    answer: [
      "Yes. You can apply with multiple lenders simultaneously to compare the available options.",
      "Comparing lenders helps you evaluate:",
      [
        "Interest rates",
        "Processing fees",
        "Loan amount eligibility",
        "Repayment options",
        "Moratorium period",
        "Loan policies and terms",
      ]
        .map((item) => `• ${item}`)
        .join("\n"),
      "At Lakshya International Edwise, we work with 20+ leading banks and NBFCs, allowing you to compare multiple offers and choose the lender that best suits your requirements.",
    ].join("\n\n"),
  },
  {
    category: "Eligibility",
    question: "I don't have a financial guarantor. Am I still eligible for an education loan?",
    answer: [
      "Yes. Lakshya offers Non-Co-Signer Education Loan programs through selected lending partners.",
      "These loans allow eligible students to obtain education financing without requiring a financial co-applicant or guarantor. Eligibility depends on factors such as your academic profile, university, course, destination country, and lender policies.",
      "Our experts will evaluate your profile and help you identify the best non-co-signer loan options available.",
    ].join("\n\n"),
  },
  {
    category: "Loan Types",
    question: "How do collateral, non-collateral, and non-co-signer education loans work?",
    answer: [
      "Collateral Education Loan (ROI from 8.25%)",
      "A collateral loan requires you to pledge an asset such as residential property, commercial property, fixed deposits, or other approved securities.",
      "Lakshya has partnerships with 20+ lenders, including leading public sector banks such as SBI, Union Bank of India, Punjab National Bank, as well as private banks and NBFCs.",
      "Most loan approvals are completed within 15–20 working days, subject to document verification and lender policies.",
      "Non-Collateral Education Loan (ROI from 10.5%)",
      "These loans do not require any property as security. However, most lenders require a financial co-applicant with a stable income.",
      "Income may include:",
      [
        "Salaried employment",
        "Business income",
        "Rental income",
        "Agricultural income",
        "Other acceptable income sources",
      ]
        .map((item) => `• ${item}`)
        .join("\n"),
      "If your financial documents are incomplete, Lakshya's experienced team will guide you in preparing the required documentation, including assistance with income tax filing and other supporting documents, wherever applicable.",
      "Non-Co-Signer Education Loan",
      "Lakshya also offers education loans without collateral and without a financial co-applicant through selected international lending partners.",
      "These loans are available for eligible students pursuing higher education in countries such as:",
      ["USA", "UK", "Germany", "Australia", "Canada and other eligible destinations"]
        .map((item) => `• ${item}`)
        .join("\n"),
      "Our team will help determine your eligibility and recommend the most suitable lender.",
    ].join("\n\n"),
  },
  {
    category: "Why Lakshya",
    question: "How is Lakshya International Edwise different from other consultancies?",
    answer: [
      "At Lakshya, we don't simply forward your application — we thoroughly evaluate your profile before applying.",
      "Our process includes:",
      [
        "Complete profile evaluation before application",
        "Identification of missing documents and profile gaps",
        "Personalized loan strategy based on your profile",
        "73-hour turnaround time for initial processing",
        "Access to 20+ banking partners",
        "Competitive interest rates and lower processing fees",
        "Complete transparency throughout the process",
        "Freedom to choose your preferred bank",
        "Pan-India service support",
      ]
        .map((item) => `• ${item}`)
        .join("\n"),
      "Students can directly interact with their preferred lender while Lakshya provides complete guidance and documentation support from start to finish.",
    ].join("\n\n"),
  },
  {
    category: "Eligibility",
    question: "My education loan was rejected by another bank. Can I still apply?",
    answer: [
      "Yes. A rejection from one lender does not mean you are ineligible everywhere.",
      "Our experts carefully analyze the reason for rejection, such as:",
      [
        "Low CIBIL score",
        "Low family income",
        "Educational gap",
        "Documentation issues",
        "University or course eligibility",
        "Insufficient financial profile",
      ]
        .map((item) => `• ${item}`)
        .join("\n"),
      "After evaluating your case, we help strengthen your profile and recommend lenders whose policies better match your eligibility.",
      "Many students who receive rejections elsewhere successfully secure loans through Lakshya.",
    ].join("\n\n"),
  },
  {
    category: "Documents",
    question: "I don't have proper financial documents. Can I still get an education loan?",
    answer: [
      "Yes. Missing financial documents do not always prevent loan approval.",
      "Lakshya works with experienced Chartered Accountants and legal professionals who help students and families prepare the required financial documentation wherever applicable and as permitted under lender guidelines.",
      "Our team provides end-to-end assistance with documentation so that your loan application is complete and professionally presented.",
      "Additional professional fees may apply for certain documentation services.",
    ].join("\n\n"),
  },
  {
    category: "Fees",
    question: "I don't have money to pay processing or service charges. Can I still apply?",
    answer: [
      "Yes. Lakshya does not charge students for loan consultation and application support.",
      "Most banks charge only their standard processing fee. For selected lenders, we can also help arrange for the processing fee to be adjusted from the loan amount, subject to lender approval.",
      "This means many students can begin their loan process with little or no upfront cost.",
    ].join("\n\n"),
  },
  {
    category: "Rates",
    question: "How can I get a lower interest rate on my education loan?",
    answer: [
      "The interest rate offered by a lender depends on several factors, including:",
      [
        "Your academic profile",
        "University ranking",
        "Course selection",
        "Country of study",
        "Co-applicant's income",
        "CIBIL score",
        "Overall financial profile",
      ]
        .map((item) => `• ${item}`)
        .join("\n"),
      "Since Lakshya works with multiple lenders, we compare various offers and negotiate wherever possible to help students secure competitive interest rates and favorable loan terms.",
    ].join("\n\n"),
  },
  {
    category: "Repayment",
    question: "Can I close my education loan during my course period?",
    answer: [
      "Yes. Most lenders allow part-payment or full loan closure after the loan has been disbursed, generally after a minimum lock-in period as specified by the lender (often around six months).",
      "If you receive funds through scholarships, part-time work, family support, or any other source, you can reduce or close your loan early. Many lenders do not charge prepayment or foreclosure penalties, allowing you to save significantly on interest.",
      "Our team will explain your lender's specific repayment and foreclosure policy before you finalize your loan.",
    ].join("\n\n"),
  },
];
