import { beforeEach, describe, expect, it, vi } from "vitest";
import { SITE_LEAD_PROMOTION_STATUS, SITE_LEAD_SOURCE } from "@/lib/constants/site-leads";

const partnerFind = vi.fn();
const partnerUpdateOne = vi.fn();
const activityFindOne = vi.fn();
const allocateWebsitePartnerLeadCode = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/Partner", () => ({
  Partner: {
    find: (...args: unknown[]) => partnerFind(...args),
    updateOne: (...args: unknown[]) => partnerUpdateOne(...args),
  },
}));

vi.mock("@/models/Activity", () => ({
  Activity: {
    findOne: (...args: unknown[]) => activityFindOne(...args),
  },
}));

vi.mock("@/lib/services/partner-id.service", () => ({
  allocateWebsitePartnerLeadCode: (...args: unknown[]) => allocateWebsitePartnerLeadCode(...args),
}));

describe("repairLegacyWebsitePartnerLeads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    allocateWebsitePartnerLeadCode.mockResolvedValue("LEAD-PTR-LIE-000099");
    partnerUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  });

  it("returns 0 when no partner rows need repair", async () => {
    partnerFind.mockReturnValue({ select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }) });

    const { repairLegacyWebsitePartnerLeads } = await import(
      "@/lib/services/website-partner-lead.service"
    );
    const repaired = await repairLegacyWebsitePartnerLeads();

    expect(repaired).toBe(0);
    expect(partnerUpdateOne).not.toHaveBeenCalled();
  });

  it("backfills partner code, lead source, isOwner, and whatsapp", async () => {
    partnerFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: { toString: () => "partner-1" },
            partnerCode: "",
            phone: "9876543210",
            location: { city: "Chennai" },
            metadata: { createdByName: "Website" },
          },
        ]),
      }),
    });
    activityFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          metadata: { isOwner: true, whatsapp: "9123456780" },
        }),
      }),
    });

    const { repairLegacyWebsitePartnerLeads } = await import(
      "@/lib/services/website-partner-lead.service"
    );
    const repaired = await repairLegacyWebsitePartnerLeads();

    expect(repaired).toBe(1);
    expect(partnerUpdateOne).toHaveBeenCalledWith(
      { _id: { toString: expect.any(Function) } },
      {
        $set: {
          partnerCode: "LEAD-PTR-LIE-000099",
          "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
          "metadata.promotionStatus": SITE_LEAD_PROMOTION_STATUS.PENDING,
          "metadata.formCity": "Chennai",
          "metadata.isOwner": true,
          "metadata.whatsapp": "9123456780",
        },
      }
    );
  });

  it("falls back to phone when whatsapp is missing", async () => {
    partnerFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: { toString: () => "partner-2" },
            partnerCode: "LEAD-PTR-LIE-000001",
            phone: "9876543210",
            metadata: {
              leadSource: SITE_LEAD_SOURCE.WEBSITE,
              promotionStatus: SITE_LEAD_PROMOTION_STATUS.PENDING,
              isOwner: false,
            },
          },
        ]),
      }),
    });
    activityFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
    });

    const { repairLegacyWebsitePartnerLeads } = await import(
      "@/lib/services/website-partner-lead.service"
    );
    await repairLegacyWebsitePartnerLeads();

    expect(partnerUpdateOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        $set: expect.objectContaining({
          "metadata.whatsapp": "9876543210",
          "metadata.isOwner": false,
        }),
      })
    );
  });
});
