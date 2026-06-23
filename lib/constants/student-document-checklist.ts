export interface DocumentChecklistItem {
  id: string;
  label: string;
  keywords: string[];
}

export const STUDENT_DOCUMENT_CHECKLIST: DocumentChecklistItem[] = [
  { id: "passport", label: "Passport", keywords: ["passport"] },
  { id: "aadhaar", label: "Aadhaar", keywords: ["aadhaar", "adhaar"] },
  { id: "pan", label: "PAN Card", keywords: ["pan"] },
  { id: "photo", label: "Photograph", keywords: ["photo", "photograph", "picture"] },
  {
    id: "offer_letter",
    label: "Offer Letter",
    keywords: ["offer letter", "admission letter", "offer"],
  },
  {
    id: "bank_statement",
    label: "Bank Statement",
    keywords: ["bank statement", "statement"],
  },
  {
    id: "income_proof",
    label: "Income Proof",
    keywords: ["income", "salary", "itr", "form 16"],
  },
  { id: "marksheet_10", label: "10th Marksheet", keywords: ["10th", "tenth", "sslc"] },
  { id: "marksheet_12", label: "12th Marksheet", keywords: ["12th", "twelfth", "hsc"] },
  {
    id: "degree",
    label: "Degree Certificate",
    keywords: ["degree", "certificate", "transcript"],
  },
  { id: "coe", label: "CoE / CAS", keywords: ["coe", "cas", "confirmation"] },
  {
    id: "loan_sanction",
    label: "Loan Sanction Letter",
    keywords: ["sanction", "loan approval"],
  },
];
