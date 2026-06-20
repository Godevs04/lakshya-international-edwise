import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import { Application } from "@/models/Application";
import { PENDING_STATUSES } from "@/lib/constants/statuses";
import type { DashboardMetrics, ChartDataPoint } from "@/types";
import type { MetricTrendInfo } from "@/lib/utils/metrics-trend";
import { formatMetricTrend } from "@/lib/utils/metrics-trend";
import { startOfDay, subMonths, format, startOfMonth, endOfMonth, subDays } from "date-fns";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await connectDB();
  const todayStart = startOfDay(new Date());

  const [
    totalStudents,
    newStudentsToday,
    totalPartners,
    pendingApplications,
    sanctioned,
    disbursed,
    rejected,
    loanAgg,
    todayCollection,
  ] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ createdAt: { $gte: todayStart } }),
    Partner.countDocuments({ status: "active" }),
    Application.countDocuments({ status: { $in: PENDING_STATUSES } }),
    Student.countDocuments({ status: "sanctioned" }),
    Student.countDocuments({ status: "disbursed" }),
    Student.countDocuments({ status: "rejected" }),
    Student.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$loan.sanctioned", 0] } },
        },
      },
    ]),
    Student.aggregate([
      {
        $match: {
          status: "disbursed",
          updatedAt: { $gte: todayStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$loan.disbursed", 0] } },
        },
      },
    ]),
  ]);

  return {
    totalStudents,
    newStudentsToday,
    totalPartners,
    pendingApplications,
    sanctioned,
    disbursed,
    rejected,
    totalLoanAmount: loanAgg[0]?.total ?? 0,
    todaysCollection: todayCollection[0]?.total ?? 0,
  };
}

export interface DashboardMetricTrends {
  totalStudents: MetricTrendInfo;
  newStudentsToday: MetricTrendInfo;
  totalPartners: MetricTrendInfo;
  pendingApplications: MetricTrendInfo;
  sanctioned: MetricTrendInfo;
  disbursed: MetricTrendInfo;
  rejected: MetricTrendInfo;
  totalLoanAmount: MetricTrendInfo;
  todaysCollection: MetricTrendInfo;
}

export async function getDashboardMetricTrends(): Promise<DashboardMetricTrends> {
  await connectDB();

  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const monthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [
    studentsThisMonth,
    studentsLastMonth,
    studentsToday,
    studentsYesterday,
    partnersThisMonth,
    partnersLastMonth,
    pendingNow,
    pendingLastMonth,
    sanctionedThisMonth,
    sanctionedLastMonth,
    disbursedThisMonth,
    disbursedLastMonth,
    rejectedThisMonth,
    rejectedLastMonth,
    loanThisMonth,
    loanLastMonth,
    collectionToday,
    collectionYesterday,
  ] = await Promise.all([
    Student.countDocuments({ createdAt: { $gte: monthStart } }),
    Student.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    Student.countDocuments({ createdAt: { $gte: todayStart } }),
    Student.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: todayStart } }),
    Partner.countDocuments({ createdAt: { $gte: monthStart } }),
    Partner.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    Application.countDocuments({ status: { $in: PENDING_STATUSES } }),
    Application.countDocuments({
      status: { $in: PENDING_STATUSES },
      updatedAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    }),
    Student.countDocuments({ status: "sanctioned", updatedAt: { $gte: monthStart } }),
    Student.countDocuments({ status: "sanctioned", updatedAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    Student.countDocuments({ status: "disbursed", updatedAt: { $gte: monthStart } }),
    Student.countDocuments({ status: "disbursed", updatedAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    Student.countDocuments({ status: "rejected", updatedAt: { $gte: monthStart } }),
    Student.countDocuments({ status: "rejected", updatedAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    Student.aggregate([
      { $match: { updatedAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$loan.sanctioned", 0] } } } },
    ]),
    Student.aggregate([
      { $match: { updatedAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$loan.sanctioned", 0] } } } },
    ]),
    Student.aggregate([
      { $match: { status: "disbursed", updatedAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$loan.disbursed", 0] } } } },
    ]),
    Student.aggregate([
      { $match: { status: "disbursed", updatedAt: { $gte: yesterdayStart, $lt: todayStart } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$loan.disbursed", 0] } } } },
    ]),
  ]);

  return {
    totalStudents: formatMetricTrend(studentsThisMonth, studentsLastMonth),
    newStudentsToday: formatMetricTrend(studentsToday, studentsYesterday),
    totalPartners: formatMetricTrend(partnersThisMonth, partnersLastMonth),
    pendingApplications: formatMetricTrend(pendingNow, pendingLastMonth),
    sanctioned: formatMetricTrend(sanctionedThisMonth, sanctionedLastMonth),
    disbursed: formatMetricTrend(disbursedThisMonth, disbursedLastMonth),
    rejected: formatMetricTrend(rejectedThisMonth, rejectedLastMonth),
    totalLoanAmount: formatMetricTrend(loanThisMonth[0]?.total ?? 0, loanLastMonth[0]?.total ?? 0),
    todaysCollection: formatMetricTrend(collectionToday[0]?.total ?? 0, collectionYesterday[0]?.total ?? 0),
  };
}

export async function getLoanStatusChart(): Promise<ChartDataPoint[]> {
  await connectDB();
  const results = await Student.aggregate([
    { $group: { _id: "$status", value: { $sum: 1 } } },
    { $sort: { value: -1 } },
  ]);
  return results.map((r) => ({
    name: r._id?.replace(/_/g, " ") ?? "Unknown",
    value: r.value,
  }));
}

export async function getMonthlyStudentsChart(): Promise<ChartDataPoint[]> {
  await connectDB();
  const sixMonthsAgo = subMonths(new Date(), 5);
  const results = await Student.aggregate([
    { $match: { createdAt: { $gte: startOfDay(sixMonthsAgo) } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        value: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return results.map((r) => ({
    name: format(new Date(r._id + "-01"), "MMM yyyy"),
    value: r.value,
  }));
}

export async function getLoanAmountChart(): Promise<ChartDataPoint[]> {
  await connectDB();
  const sixMonthsAgo = subMonths(new Date(), 5);
  const results = await Student.aggregate([
    { $match: { createdAt: { $gte: startOfDay(sixMonthsAgo) } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        value: { $sum: { $ifNull: ["$loan.sanctioned", 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return results.map((r) => ({
    name: format(new Date(r._id + "-01"), "MMM yyyy"),
    value: r.value,
  }));
}

export async function getTopPartnersChart(): Promise<ChartDataPoint[]> {
  await connectDB();
  const results = await Partner.find({ status: "active" })
    .sort({ totalLoanValue: -1 })
    .limit(5)
    .select("companyName totalLoanValue")
    .lean();
  return results.map((p) => ({
    name: p.companyName,
    value: p.totalLoanValue,
  }));
}

export async function getLatestStudents(limit = 5) {
  await connectDB();
  return Student.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("partnerId", "companyName")
    .lean();
}

export async function getLatestPartners(limit = 5) {
  await connectDB();
  return Partner.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getUpcomingFollowups(limit = 5) {
  await connectDB();
  const now = new Date();
  return Student.aggregate([
    { $unwind: "$notes" },
    {
      $match: {
        "notes.dueDate": { $gte: now },
      },
    },
    { $sort: { "notes.dueDate": 1 } },
    { $limit: limit },
    {
      $project: {
        studentId: 1,
        firstName: 1,
        lastName: 1,
        note: "$notes.content",
        dueDate: "$notes.dueDate",
      },
    },
  ]);
}
