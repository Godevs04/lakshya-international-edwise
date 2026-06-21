/**
 * Counts MongoDB operations for the full overview dashboard payload.
 * Usage: npx tsx scripts/verify-overview-queries.ts
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
  const dashboard = await import("@/lib/services/dashboard.service");
  const { getRecentActivities } = await import("@/lib/services/activity.service");

  await connectDB();

  counter.reset();
  const coreStarted = performance.now();
  await dashboard.getDashboardCoreStats();
  const coreElapsed = Math.round(performance.now() - coreStarted);
  const coreOps = counter.queryOps();
  const coreSummary = summarizeOps("Core stats", coreOps);

  counter.reset();
  const restStarted = performance.now();
  await Promise.all([
    dashboard.getLoanStatusChart(),
    dashboard.getMonthlyStudentsChart(),
    dashboard.getLoanAmountChart(),
    dashboard.getTopPartnersChart(),
    getRecentActivities(8),
    dashboard.getLatestStudents(5),
    dashboard.getLatestPartners(5),
    dashboard.getUpcomingFollowups(5),
  ]);
  const restElapsed = Math.round(performance.now() - restStarted);
  const restOps = counter.queryOps();
  const restSummary = summarizeOps("Charts and lists", restOps);

  const totalStudentAggregates =
    coreSummary.studentAggregate + restSummary.studentAggregate;
  const totalStudentCounts =
    coreSummary.studentCountDocuments + restSummary.studentCountDocuments;

  logger.info("Overview dashboard query verification", {
    coreDurationMs: coreElapsed,
    restDurationMs: restElapsed,
    totalDurationMs: coreElapsed + restElapsed,
    core: coreSummary,
    rest: restSummary,
    totals: {
      studentAggregate: totalStudentAggregates,
      studentCountDocuments: totalStudentCounts,
    },
  });

  const coreOk =
    coreSummary.aggregate === 3 &&
    coreSummary.countDocuments === 0 &&
    coreSummary.studentAggregate === 1;
  const restOk =
    restSummary.studentCountDocuments === 0 && restSummary.studentAggregate <= 4;
  const ok = coreOk && restOk;

  logger.info(
    ok
      ? "PASS — core stats use 1 student aggregate; no Student.countDocuments"
      : "FAIL — unexpected student query pattern (N+1 may still be present)"
  );

  await mongoose.disconnect();
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  logger.error("verify-overview-queries failed", err);
  process.exit(1);
});
