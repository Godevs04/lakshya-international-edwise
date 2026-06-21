/**
 * Counts MongoDB operations for dashboard core stats (3 aggregates, 0 countDocuments).
 * Usage: npx tsx scripts/verify-dashboard-queries.ts
 */
import "./load-env";
import mongoose from "mongoose";
import { logger } from "@/lib/logger";
import { connectDB } from "@/lib/db/mongoose";
import {
  createQueryCounter,
  summarizeOps,
} from "./lib/mongodb-query-counter";

const counter = createQueryCounter();

async function main() {
  const { getDashboardCoreStats } = await import("@/lib/services/dashboard.service");

  await connectDB();
  counter.reset();

  const started = performance.now();
  const stats = await getDashboardCoreStats();
  const elapsed = Math.round(performance.now() - started);

  const queryOps = counter.queryOps();
  const summary = summarizeOps("Dashboard core stats", queryOps);

  logger.info("Dashboard core stats query verification", {
    durationMs: elapsed,
    ...summary,
    sampleMetrics: {
      totalStudents: stats.metrics.totalStudents,
      totalPartners: stats.metrics.totalPartners,
      pendingApplications: stats.metrics.pendingApplications,
    },
  });

  const ok = summary.aggregate === 3 && summary.countDocuments === 0;
  logger.info(ok ? "PASS — N+1 pattern resolved for core stats" : "FAIL — unexpected query pattern");

  await mongoose.disconnect();
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  logger.error("verify-dashboard-queries failed", err);
  process.exit(1);
});
