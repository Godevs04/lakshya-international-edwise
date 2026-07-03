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

  it("rejects invalid phone for eligibility", () => {
    const result = websiteEnquirySchema.safeParse({
      name: "Test User",
      phone: "123",
      enquiryType: "eligibility",
    });
    expect(result.success).toBe(false);
  });
});

describe("partnerEnquirySchema", () => {
  it("accepts partner enquiry without whatsapp when not owner", () => {
    const result = partnerEnquirySchema.safeParse({
      name: "Raj Kumar",
      email: "raj@agency.com",
      phone: "9876543210",
      companyName: "Global Edu Partners",
      city: "Hyderabad",
      isOwner: "false",
    });
    expect(result.success).toBe(true);
  });

  it("accepts partner enquiry with whatsapp when owner", () => {
    const result = partnerEnquirySchema.safeParse({
      name: "Raj Kumar",
      email: "raj@agency.com",
      phone: "9876543210",
      companyName: "Global Edu Partners",
      city: "Hyderabad",
      isOwner: "true",
      whatsapp: "9123456780",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isOwner).toBe(true);
    }
  });

  it("rejects invalid whatsapp when owner provides one", () => {
    const result = partnerEnquirySchema.safeParse({
      name: "Raj Kumar",
      email: "raj@agency.com",
      phone: "9876543210",
      companyName: "Global Edu Partners",
      city: "Hyderabad",
      isOwner: "true",
      whatsapp: "123",
    });
    expect(result.success).toBe(false);
  });
});
