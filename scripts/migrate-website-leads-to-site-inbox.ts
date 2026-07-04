/**
 * One-time migration: move existing website student leads into the From Site inbox.
 *
 * - Finds students with recordType "lead", metadata.leadSource "website", not yet promoted
 * - Re-IDs STU-* website leads to LEAD-* (preserves Mongo _id)
 * - Sets metadata.promotionStatus to "pending" where missing
 *
 * Usage:
 *   npx tsx scripts/migrate-website-leads-to-site-inbox.ts --dry-run
 *   npx tsx scripts/migrate-website-leads-to-site-inbox.ts --confirm
 */
import "./load-env";
import { connectDB } from "@/lib/db/mongoose";
import { getMongoUri } from "@/lib/config/env";
import { STUDENT_RECORD_TYPE } from "@/lib/constants/student-record-type";
import {
  SITE_LEAD_PROMOTION_STATUS,
  SITE_LEAD_SOURCE,
} from "@/lib/constants/site-leads";
import {
  buildWebsiteLeadIdPrefix,
  parseWebsiteLeadIdSequence,
} from "@/lib/services/student-id.service";
import { logger } from "@/lib/logger";
import { Student } from "@/models/Student";

interface CliOptions {
  dryRun: boolean;
  confirm: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const dryRun = argv.includes("--dry-run");
  const confirm = argv.includes("--confirm");

  if (!dryRun && !confirm) {
    logger.error("Refusing to run without a safety flag.");
    logger.error("  Preview:  npx tsx scripts/migrate-website-leads-to-site-inbox.ts --dry-run");
    logger.error("  Apply:    npx tsx scripts/migrate-website-leads-to-site-inbox.ts --confirm");
    process.exit(1);
  }

  if (dryRun && confirm) {
    logger.error("Use only one of --dry-run or --confirm.");
    process.exit(1);
  }

  return { dryRun, confirm };
}

function isOfficialStudentId(studentId: string): boolean {
  return /^STU-/.test(studentId);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  try {
    getMongoUri();
  } catch {
    logger.error("MONGODB_URI is required in .env.local or .env");
    process.exit(1);
  }

  await connectDB();
  logger.info("Connected to MongoDB\n");

  const leads = await Student.find({
    recordType: STUDENT_RECORD_TYPE.ADMISSION,
    "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
    $or: [
      { "metadata.promotionStatus": { $exists: false } },
      { "metadata.promotionStatus": SITE_LEAD_PROMOTION_STATUS.PENDING },
    ],
  })
    .select("studentId firstName lastName metadata.promotionStatus createdAt")
    .sort({ createdAt: 1 })
    .lean();

  logger.info(`Found ${leads.length} website student lead(s) to migrate.\n`);

  if (!leads.length) {
    logger.info("Nothing to migrate.");
    process.exit(0);
  }

  let nextSequence = 0;
  const leadPrefix = buildWebsiteLeadIdPrefix();
  const existingLeadIds = await Student.find({
    studentId: new RegExp(`^${leadPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\d+$`),
  })
    .select("studentId")
    .lean();

  for (const { studentId } of existingLeadIds) {
    const sequence = parseWebsiteLeadIdSequence(studentId);
    if (sequence !== null && sequence > nextSequence) {
      nextSequence = sequence;
    }
  }

  for (const lead of leads) {
    const needsReId = isOfficialStudentId(lead.studentId);
    const needsPromotionStatus = !lead.metadata?.promotionStatus;

    if (!needsReId && !needsPromotionStatus) {
      logger.info(`Skip ${lead.studentId} — already migrated`);
      continue;
    }

    const nextLeadId = needsReId
      ? `${leadPrefix}${String(++nextSequence).padStart(6, "0")}`
      : lead.studentId;

    logger.info(
      `${options.dryRun ? "[dry-run] " : ""}Migrate ${lead.studentId} → ${nextLeadId} (promotionStatus: pending)`
    );

    if (!options.dryRun) {
      await Student.updateOne(
        { _id: lead._id },
        {
          $set: {
            ...(needsReId ? { studentId: nextLeadId } : {}),
            "metadata.promotionStatus": SITE_LEAD_PROMOTION_STATUS.PENDING,
            "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
          },
        }
      );
    }
  }

  if (options.dryRun) {
    logger.info("\nDry run complete. Re-run with --confirm to apply changes.");
  } else {
    logger.info("\nMigration complete.");
  }

  process.exit(0);
}

main().catch((error) => {
  logger.error("Migration failed", error);
  process.exit(1);
});
