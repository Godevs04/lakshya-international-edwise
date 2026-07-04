import { describe, expect, it } from "vitest";
import { websiteEnquirySchema, partnerEnquirySchema } from "@/lib/validations/schemas";

describe("websiteEnquirySchema eligibility fields", () => {
  it("accepts eligibility enquiry with loan metadata", () => {
    const result = websiteEnquirySchema.safeParse({
      name: "Priya Sharma",
      phone: "9876543210",
      email: "priya@example.com",
      enquiryType: "eligibility",
      loanRequired: "true",
      loanAmount: "40 Lakh",
      currentStatus: "Received admit",
      preferredLender: "SBI",
      message: "Need non-collateral option",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enquiryType).toBe("eligibility");
      expect(result.data.loanAmount).toBe("40 Lakh");
      expect(result.data.preferredLender).toBe("SBI");
    }
  });

  it("accepts empty eligibility honeypot field", () => {
    const result = websiteEnquirySchema.safeParse({
      name: "Priya Sharma",
      phone: "9876543210",
      enquiryType: "eligibility",
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects filled eligibility honeypot field", () => {
    const result = websiteEnquirySchema.safeParse({
      name: "Priya Sharma",
      phone: "9876543210",
      enquiryType: "eligibility",
      website: "bot.example",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid phone for eligibility", () => {
    const result = websiteEnquirySchema.safeParse({
      name: "Test User",
      phone: "123",
      enquiryType: "eligibility",
    });
    expect(result.success).toBe(false);
  });

  it("accepts contact enquiry with structured subject", () => {
    const result = websiteEnquirySchema.safeParse({
      name: "Anita Rao",
      phone: "9876543210",
      enquiryType: "contact",
      subject: "Loan for Canada MBA",
      message: "Please call me tomorrow morning.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subject).toBe("Loan for Canada MBA");
      expect(result.data.message).toBe("Please call me tomorrow morning.");
    }
  });
});

describe("partnerEnquirySchema", () => {
  it("accepts partner enquiry when mobile is WhatsApp", () => {
    const result = partnerEnquirySchema.safeParse({
      name: "Raj Kumar",
      email: "raj@agency.com",
      phone: "9876543210",
      companyName: "Global Edu Partners",
      city: "Hyderabad",
      isOwner: "false",
      mobileIsWhatsapp: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mobileIsWhatsapp).toBe(true);
    }
  });

  it("accepts partner enquiry with separate whatsapp when mobile is not WhatsApp", () => {
    const result = partnerEnquirySchema.safeParse({
      name: "Raj Kumar",
      email: "raj@agency.com",
      phone: "9876543210",
      companyName: "Global Edu Partners",
      city: "Hyderabad",
      isOwner: "true",
      mobileIsWhatsapp: "false",
      whatsapp: "9123456780",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mobileIsWhatsapp).toBe(false);
    }
  });

  it("rejects missing whatsapp when mobile is not WhatsApp", () => {
    const result = partnerEnquirySchema.safeParse({
      name: "Raj Kumar",
      email: "raj@agency.com",
      phone: "9876543210",
      companyName: "Global Edu Partners",
      city: "Hyderabad",
      isOwner: "true",
      mobileIsWhatsapp: "false",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid whatsapp when mobile is not WhatsApp", () => {
    const result = partnerEnquirySchema.safeParse({
      name: "Raj Kumar",
      email: "raj@agency.com",
      phone: "9876543210",
      companyName: "Global Edu Partners",
      city: "Hyderabad",
      isOwner: "true",
      mobileIsWhatsapp: "false",
      whatsapp: "123",
    });
    expect(result.success).toBe(false);
  });
});
