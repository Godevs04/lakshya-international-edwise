import { connectDB } from "@/lib/db/mongoose";
import { Types } from "mongoose";
import { Lender } from "@/models/Lender";
import { Student } from "@/models/Student";
import { LENDER_SEEDS } from "@/lib/constants/lenders";

export async function ensureLenderSeeds() {
  await connectDB();
  for (const seed of LENDER_SEEDS) {
    await Lender.updateOne(
      { slug: seed.slug },
      { $setOnInsert: { name: seed.name, slug: seed.slug, status: "active" } },
      { upsert: true }
    );
  }
}

export async function resolveLenderNameBySlug(
  slug?: string
): Promise<string | undefined> {
  if (!slug?.trim()) return undefined;

  const normalized = slug.trim().toLowerCase();
  const existing = await Lender.findOne({ slug: normalized }).select("name").lean();
  if (existing) return existing.name;

  const seed = LENDER_SEEDS.find((entry) => entry.slug === normalized);
  return seed?.name;
}

export async function resolveLenderIdBySlug(
  slug?: string
): Promise<Types.ObjectId | undefined> {
  if (!slug?.trim()) return undefined;

  const normalized = slug.trim().toLowerCase();
  const existing = await Lender.findOne({ slug: normalized }).select("_id").lean();
  if (existing) {
    return existing._id;
  }

  const seed = LENDER_SEEDS.find((entry) => entry.slug === normalized);
  if (!seed) return undefined;

  const created = await Lender.create({ name: seed.name, slug: seed.slug });
  return created._id;
}

export async function getLenderSlugById(
  lenderId?: Types.ObjectId | string | null
): Promise<string | undefined> {
  if (!lenderId) return undefined;

  const lender = await Lender.findById(lenderId).select("slug").lean();
  return lender?.slug;
}

export async function getLendersWithCounts() {
  await ensureLenderSeeds();

  const lenders = await Lender.find({ status: "active" }).sort({ name: 1 }).lean();
  const counts = await Student.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { "loan.lenderId": { $exists: true, $ne: null } } },
    { $group: { _id: "$loan.lenderId", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(counts.map((entry) => [entry._id.toString(), entry.count]));

  return lenders.map((lender) => ({
    _id: lender._id.toString(),
    name: lender.name,
    slug: lender.slug,
    applicationCount: countMap.get(lender._id.toString()) ?? 0,
  }));
}
