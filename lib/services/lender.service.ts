import { connectDB } from "@/lib/db/mongoose";
import { Types } from "mongoose";
import { Lender } from "@/models/Lender";
import { Student } from "@/models/Student";
import { LENDER_SEEDS, normalizeLenderSlug, isLenderSeedSlug } from "@/lib/constants/lenders";
import type { LenderOption } from "@/types";
import { sanitizeText } from "@/lib/utils/sanitize";
import { isValidCloudinaryUrl, isValidCloudinaryPublicId } from "@/lib/services/upload.service";
import { slugifyLenderName } from "@/lib/constants/lenders";

export { slugifyLenderName, isLenderSeedSlug };

function resolveLenderVisuals(lender: {
  slug: string;
  logoUrl?: string | null;
  accentColor?: string | null;
}): { logo?: string; accent?: string } {
  const seed = LENDER_SEEDS.find((entry) => entry.slug === lender.slug);
  return {
    logo: lender.logoUrl ?? seed?.logo,
    accent: lender.accentColor ?? seed?.accent ?? "#6D5EF7",
  };
}

export async function ensureLenderSeeds() {
  await connectDB();
  for (const seed of LENDER_SEEDS) {
    await Lender.updateOne(
      { slug: seed.slug },
      {
        $setOnInsert: {
          name: seed.name,
          slug: seed.slug,
          status: "active",
          logoUrl: seed.logo,
          accentColor: seed.accent,
        },
      },
      { upsert: true }
    );
  }
}

export async function resolveLenderNameBySlug(
  slug?: string
): Promise<string | undefined> {
  if (!slug?.trim()) return undefined;

  const normalized = normalizeLenderSlug(slug);
  if (!normalized) return undefined;

  const existing = await Lender.findOne({
    $or: [{ slug: normalized }, { slug: slug?.trim().toLowerCase() }],
  })
    .select("name")
    .lean();
  if (existing) return existing.name;

  const seed = LENDER_SEEDS.find((entry) => entry.slug === normalized);
  return seed?.name;
}

export async function resolveLenderIdBySlug(
  slug?: string
): Promise<Types.ObjectId | undefined> {
  if (!slug?.trim()) return undefined;

  const normalized = normalizeLenderSlug(slug);
  if (!normalized) return undefined;

  let existing = await Lender.findOne({ slug: normalized }).select("_id").lean();
  if (!existing && slug?.trim().toLowerCase() !== normalized) {
    existing = await Lender.findOne({ slug: slug.trim().toLowerCase() }).select("_id").lean();
    if (existing && normalized === "credila") {
      await Lender.updateOne({ _id: existing._id }, { $set: { slug: "credila", name: "Credila" } });
    }
  }
  if (existing) {
    return existing._id;
  }

  const seed = LENDER_SEEDS.find((entry) => entry.slug === normalized);
  if (!seed) return undefined;

  const created = await Lender.create({
    name: seed.name,
    slug: seed.slug,
    logoUrl: seed.logo,
    accentColor: seed.accent,
  });
  return created._id;
}

export async function getLenderSlugById(
  lenderId?: Types.ObjectId | string | null
): Promise<string | undefined> {
  if (!lenderId) return undefined;

  const lender = await Lender.findById(lenderId).select("slug").lean();
  return lender?.slug;
}

export async function getLenderOptions(): Promise<LenderOption[]> {
  await ensureLenderSeeds();

  const lenders = await Lender.find({ status: "active" }).sort({ name: 1 }).lean();
  return lenders.map((lender) => {
    const visuals = resolveLenderVisuals(lender);
    return {
      slug: lender.slug,
      name: lender.name,
      logo: visuals.logo,
      accent: visuals.accent,
    };
  });
}

export async function getLenderUsageCounts(): Promise<Map<string, number>> {
  await connectDB();

  const students = await Student.find({
    $or: [
      { "loan.lenderId": { $exists: true, $ne: null } },
      { "loanApplications.lenderId": { $exists: true, $ne: null } },
    ],
  })
    .select("loan.lenderId loanApplications.lenderId")
    .lean();

  const countMap = new Map<string, number>();
  for (const student of students) {
    const lenderIds = new Set<string>();
    if (student.loan?.lenderId) {
      lenderIds.add(student.loan.lenderId.toString());
    }
    for (const application of student.loanApplications ?? []) {
      if (application.lenderId) {
        lenderIds.add(application.lenderId.toString());
      }
    }
    for (const lenderId of lenderIds) {
      countMap.set(lenderId, (countMap.get(lenderId) ?? 0) + 1);
    }
  }

  return countMap;
}

export async function getLendersWithCounts() {
  await ensureLenderSeeds();

  const lenders = await Lender.find({ status: "active" }).sort({ name: 1 }).lean();
  const countMap = await getLenderUsageCounts();

  return lenders.map((lender) => {
    const visuals = resolveLenderVisuals(lender);
    return {
      _id: lender._id.toString(),
      name: lender.name,
      slug: lender.slug,
      logo: visuals.logo,
      accent: visuals.accent,
      applicationCount: countMap.get(lender._id.toString()) ?? 0,
      isSeed: isLenderSeedSlug(lender.slug),
    };
  });
}

export async function countLenderUsage(lenderId: Types.ObjectId | string): Promise<number> {
  await connectDB();
  const objectId = typeof lenderId === "string" ? new Types.ObjectId(lenderId) : lenderId;
  return Student.countDocuments({
    $or: [{ "loan.lenderId": objectId }, { "loanApplications.lenderId": objectId }],
  });
}

export async function updateLender(
  id: string,
  input: {
    name: string;
    logoUrl?: string;
    logoPublicId?: string;
    accentColor?: string;
  }
) {
  await connectDB();

  const lender = await Lender.findById(id);
  if (!lender) {
    throw new Error("Bank not found");
  }

  const name = sanitizeText(input.name);
  if (!name) {
    throw new Error("Bank name is required");
  }

  const duplicate = await Lender.findOne({
    _id: { $ne: lender._id },
    name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  })
    .select("_id")
    .lean();
  if (duplicate) {
    throw new Error("A bank with this name already exists");
  }

  if (input.logoUrl && !input.logoUrl.startsWith("/") && !isValidCloudinaryUrl(input.logoUrl)) {
    throw new Error("Logo must be uploaded through the image field");
  }

  if (input.logoPublicId && !isValidCloudinaryPublicId(input.logoPublicId, "lenders")) {
    throw new Error("Invalid logo upload path");
  }

  lender.name = name;
  lender.logoUrl = input.logoUrl || undefined;
  lender.logoPublicId = input.logoPublicId || undefined;
  lender.accentColor = input.accentColor || undefined;
  await lender.save();

  return lender;
}

export async function deleteLender(id: string) {
  await connectDB();

  const lender = await Lender.findById(id);
  if (!lender) {
    throw new Error("Bank not found");
  }

  if (isLenderSeedSlug(lender.slug)) {
    throw new Error("Built-in banks cannot be deleted");
  }

  const usageCount = await countLenderUsage(lender._id);
  if (usageCount > 0) {
    throw new Error(
      `Cannot delete — ${usageCount} student application${usageCount === 1 ? "" : "s"} use this bank`
    );
  }

  await Lender.deleteOne({ _id: lender._id });
  return lender;
}

export async function createLender(input: {
  name: string;
  slug?: string;
  logoUrl?: string;
  logoPublicId?: string;
  accentColor?: string;
}) {
  await connectDB();

  const name = sanitizeText(input.name);
  if (!name) {
    throw new Error("Bank name is required");
  }

  const slug = slugifyLenderName(input.slug?.trim() || name);
  if (!slug) {
    throw new Error("Could not generate a valid bank code from the name");
  }

  const duplicate = await Lender.findOne({
    $or: [{ slug }, { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }],
  })
    .select("_id")
    .lean();
  if (duplicate) {
    throw new Error("A bank with this name already exists");
  }

  if (input.logoUrl && !input.logoUrl.startsWith("/") && !isValidCloudinaryUrl(input.logoUrl)) {
    throw new Error("Logo must be uploaded through the image field");
  }

  if (input.logoPublicId && !isValidCloudinaryPublicId(input.logoPublicId, "lenders")) {
    throw new Error("Invalid logo upload path");
  }

  return Lender.create({
    name,
    slug,
    logoUrl: input.logoUrl || undefined,
    logoPublicId: input.logoPublicId || undefined,
    accentColor: input.accentColor || undefined,
    status: "active",
  });
}
