import { connectDB } from "@/lib/db/mongoose";
import { SupportFaq } from "@/models/SupportFaq";
import { MARKETING_FAQS } from "@/lib/constants/marketing/faqs";
import { logger } from "@/lib/logger";

function keywordsFromQuestion(question: string, category: string): string[] {
  const stop = new Set([
    "a",
    "an",
    "the",
    "is",
    "are",
    "can",
    "i",
    "my",
    "to",
    "for",
    "of",
    "and",
    "or",
    "with",
    "in",
    "on",
    "do",
    "does",
    "what",
    "how",
    "when",
    "which",
  ]);
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9₹\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  return Array.from(new Set([category.toLowerCase(), ...words])).slice(0, 24);
}

/** Upsert SupportFaq documents from static marketing FAQs. */
export async function seedSupportFaqsFromMarketing(): Promise<{ upserted: number }> {
  await connectDB();
  let upserted = 0;

  for (const [index, faq] of MARKETING_FAQS.entries()) {
    const category = faq.category ?? "General";
    const result = await SupportFaq.updateOne(
      { question: faq.question },
      {
        $set: {
          answer: faq.answer,
          category,
          keywords: keywordsFromQuestion(faq.question, category),
          priority: MARKETING_FAQS.length - index,
          isActive: true,
        },
        $setOnInsert: {
          views: 0,
          helpfulCount: 0,
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount || result.modifiedCount) upserted += 1;
  }

  logger.info("support.faq.seeded", { upserted, total: MARKETING_FAQS.length });
  return { upserted };
}
