import { createHash, randomUUID } from "node:crypto";
import { connectDB } from "@/lib/db/mongoose";
import { SupportFaq } from "@/models/SupportFaq";
import { seedSupportFaqsFromMarketing } from "@/lib/services/support-faq.service";

export type SupportFaqMatch = {
  id: string;
  question: string;
  answer: string;
  category: string;
  score: number;
};

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9₹\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

export async function ensureSupportFaqsSeeded() {
  await connectDB();
  const count = await SupportFaq.countDocuments({ isActive: true });
  if (count === 0) {
    await seedSupportFaqsFromMarketing();
  }
}

export async function listPopularSupportFaqs(limit = 8): Promise<SupportFaqMatch[]> {
  await ensureSupportFaqsSeeded();
  const rows = await SupportFaq.find({ isActive: true })
    .sort({ priority: -1, helpfulCount: -1, views: -1 })
    .limit(limit)
    .lean();

  return rows.map((row) => ({
    id: row._id.toString(),
    question: row.question,
    answer: row.answer,
    category: row.category,
    score: row.priority,
  }));
}

export async function searchSupportFaqs(query: string, limit = 5): Promise<SupportFaqMatch[]> {
  await ensureSupportFaqsSeeded();
  const tokens = tokenize(query);
  if (!tokens.length) return listPopularSupportFaqs(limit);

  const faqs = await SupportFaq.find({ isActive: true }).lean();
  const scored = faqs
    .map((faq) => {
      const haystack =
        `${faq.question} ${faq.answer} ${faq.keywords.join(" ")} ${faq.category}`.toLowerCase();
      let score = 0;
      for (const token of tokens) {
        if (faq.question.toLowerCase().includes(token)) score += 4;
        if (faq.keywords.some((k) => k.includes(token))) score += 3;
        if (faq.category.toLowerCase().includes(token)) score += 2;
        if (haystack.includes(token)) score += 1;
      }
      return {
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

export async function getSupportFaqById(id: string) {
  await connectDB();
  return SupportFaq.findById(id).lean();
}

export async function recordSupportFaqView(id: string) {
  await connectDB();
  await SupportFaq.updateOne({ _id: id }, { $inc: { views: 1 } });
}

export async function recordSupportFaqHelpful(id: string, helpful: boolean) {
  await connectDB();
  if (helpful) {
    await SupportFaq.updateOne({ _id: id }, { $inc: { helpfulCount: 1 } });
  }
}

export function createVisitorId(): string {
  return randomUUID();
}

export function hashContact(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}
