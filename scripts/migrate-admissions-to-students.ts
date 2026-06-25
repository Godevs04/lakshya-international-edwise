/**
 * One-time migration: promote admission leads to full student records.
 *
 * Admission menu stores rows with recordType "lead". Students menu excludes those.
 * This script sets recordType to "student" for every lead, keeping all other fields
 * (name, phone, university, admissionRevenue, loan, notes, etc.) unchanged.
 *
 * Usage:
 *   npx tsx scripts/migrate-admissions-to-students.ts --dry-run
 *   npx tsx scripts/migrate-admissions-to-students.ts --confirm
 */
import "./load-env";
import { connectDB } from "@/lib/db/mongoose";
import { getMongoUri } from "@/lib/config/env";
import { STUDENT_RECORD_TYPE } from "@/lib/constants/student-record-type";
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
    logger.error("  Preview:  npx tsx scripts/migrate-admissions-to-students.ts --dry-run");
    logger.error("  Apply:    npx tsx scripts/migrate-admissions-to-students.ts --confirm");
    process.exit(1);
  }

  if (dryRun && confirm) {
    logger.error("Use only one of --dry-run or --confirm.");
    process.exit(1);
  }

  return { dryRun, confirm };
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

  const leads = await Student.find({ recordType: STUDENT_RECORD_TYPE.ADMISSION })
    .select("studentId firstName lastName phone targetUniversity admissionRevenue createdAt")
    .sort({ createdAt: 1 })
    .lean();

  if (leads.length === 0) {
    logger.info("No admission leads found (recordType=lead). Nothing to migrate.");
    process.exit(0);
  }

  logger.info(`Found ${leads.length} admission lead(s):\n`);
  for (const lead of leads) {
    const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
    const revenue =
      lead.admissionRevenue != null && lead.admissionRevenue > 0
        ? ` | revenue ?${lead.admissionRevenue}`
        : "";
    logger.info(
      `  · ${lead.studentId} · ${name}${lead.phone ? ` (${lead.phone})` : ""}${revenue}`
    );
  }

  if (options.dryRun) {
    logger.info("\nDry run only. No database changes were made.");
    logger.info("To apply: bash scripts/migrate-admissions-to-students.sh");
    process.exit(0);
  }

  const result = await Student.updateMany(
    { recordType: STUDENT_RECORD_TYPE.ADMISSION },
    { $set: { recordType: STUDENT_RECORD_TYPE.STUDENT } }
  );

  logger.info(
    `\nMigrated ${result.modifiedCount} record(s) to Students (recordType=student).`
  );
  logger.info("All profile, loan, note, and admission revenue fields were left unchanged.");
  process.exit(0);
}

main().catch((error) => {
  logger.error("Migration failed:", error);
  process.exit(1);
});
