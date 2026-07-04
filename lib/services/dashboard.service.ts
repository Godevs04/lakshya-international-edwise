import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import { Application } from "@/models/Application";
import { PENDING_STATUSES } from "@/lib/constants/statuses";
import type { DashboardMetrics, ChartDataPoint } from "@/types";
import type { MetricTrendInfo } from "@/lib/utils/metrics-trend";
import { formatMetricTrend } from "@/lib/utils/metrics-trend";
import { excludeAdmissionLeadsFilter } from "@/lib/constants/student-record-type";
import { officialPartnersFilter } from "@/lib/constants/site-leads";
import { buildStudentVisibilityFilter } from "@/lib/services/student-visibility.service";
import { mergeMongoFilter } from "@/lib/utils/mongo-filter";
import type { SessionUser } from "@/types";
import { startOfDay, subMonths, format, startOfMonth, endOfMonth, subDays } from "date-fns";

interface DashboardDateBounds {
  now: Date;
  todayStart: Date;
  yesterdayStart: Date;
  monthStart: Date;
  lastMonthStart: Date;
  lastMonthEnd: Date;
}

function getDashboardDateBounds(now = new Date()): DashboardDateBounds {
  return {
    now,
    todayStart: startOfDay(now),
    yesterdayStart: startOfDay(subDays(now, 1)),
    monthStart: startOfMonth(now),
    lastMonthStart: startOfMonth(subMonths(now, 1)),
    lastMonthEnd: endOfMonth(subMonths(now, 1)),
  };
}

interface StudentDashboardAggregateRow {
  totalStudents: number;
  newStudentsToday: number;
  sanctioned: number;
  disbursed: number;
  rejected: number;
  totalLoanAmount: number;
  todaysCollection: number;
  studentsThisMonth: number;
  studentsLastMonth: number;
  studentsToday: number;
  studentsYesterday: number;
  sanctionedThisMonth: number;
  sanctionedLastMonth: number;
  disbursedThisMonth: number;
  disbursedLastMonth: number;
  rejectedThisMonth: number;
  rejectedLastMonth: number;
  loanThisMonth: number;
  loanLastMonth: number;
  collectionToday: number;
  collectionYesterday: number;
}

interface PartnerDashboardAggregateRow {
  totalPartners: number;
  partnersThisMonth: number;
  partnersLastMonth: number;
}

interface ApplicationDashboardAggregateRow {
  pendingApplications: number;
  pendingLastMonth: number;
}

function buildStudentDashboardPipeline(bounds: DashboardDateBounds) {
  const {
    todayStart,
    yesterdayStart,
    monthStart,
    lastMonthStart,
    lastMonthEnd,
  } = bounds;

  return [
    { $match: excludeAdmissionLeadsFilter() },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        newStudentsToday: {
          $sum: { $cond: [{ $gte: ["$createdAt", todayStart] }, 1, 0] },
        },
        sanctioned: {
          $sum: { $cond: [{ $eq: ["$status", "sanctioned"] }, 1, 0] },
        },
        disbursed: {
          $sum: { $cond: [{ $eq: ["$status", "disbursed"] }, 1, 0] },
        },
        rejected: {
          $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
        },
        totalLoanAmount: { $sum: { $ifNull: ["$loan.sanctioned", 0] } },
        todaysCollection: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "disbursed"] },
                  { $gte: ["$updatedAt", todayStart] },
                ],
              },
              { $ifNull: ["$loan.disbursed", 0] },
              0,
            ],
          },
        },
        studentsThisMonth: {
          $sum: { $cond: [{ $gte: ["$createdAt", monthStart] }, 1, 0] },
        },
        studentsLastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", lastMonthStart] },
                  { $lte: ["$createdAt", lastMonthEnd] },
                ],
              },
              1,
              0,
            ],
          },
        },
        studentsToday: {
          $sum: { $cond: [{ $gte: ["$createdAt", todayStart] }, 1, 0] },
        },
        studentsYesterday: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", yesterdayStart] },
                  { $lt: ["$createdAt", todayStart] },
                ],
              },
              1,
              0,
            ],
          },
        },
        sanctionedThisMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "sanctioned"] },
                  { $gte: ["$updatedAt", monthStart] },
                ],
              },
              1,
              0,
            ],
          },
        },
        sanctionedLastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "sanctioned"] },
                  { $gte: ["$updatedAt", lastMonthStart] },
                  { $lte: ["$updatedAt", lastMonthEnd] },
                ],
              },
              1,
              0,
            ],
          },
        },
        disbursedThisMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "disbursed"] },
                  { $gte: ["$updatedAt", monthStart] },
                ],
              },
              1,
              0,
            ],
          },
        },
        disbursedLastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "disbursed"] },
                  { $gte: ["$updatedAt", lastMonthStart] },
                  { $lte: ["$updatedAt", lastMonthEnd] },
                ],
              },
              1,
              0,
            ],
          },
        },
        rejectedThisMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "rejected"] },
                  { $gte: ["$updatedAt", monthStart] },
                ],
              },
              1,
              0,
            ],
          },
        },
        rejectedLastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "rejected"] },
                  { $gte: ["$updatedAt", lastMonthStart] },
                  { $lte: ["$updatedAt", lastMonthEnd] },
                ],
              },
              1,
              0,
            ],
          },
        },
        loanThisMonth: {
          $sum: {
            $cond: [
              { $gte: ["$updatedAt", monthStart] },
              { $ifNull: ["$loan.sanctioned", 0] },
              0,
            ],
          },
        },
        loanLastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$updatedAt", lastMonthStart] },
                  { $lte: ["$updatedAt", lastMonthEnd] },
                ],
              },
              { $ifNull: ["$loan.sanctioned", 0] },
              0,
            ],
          },
        },
        collectionToday: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "disbursed"] },
                  { $gte: ["$updatedAt", todayStart] },
                ],
              },
              { $ifNull: ["$loan.disbursed", 0] },
              0,
            ],
          },
        },
        collectionYesterday: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "disbursed"] },
                  { $gte: ["$updatedAt", yesterdayStart] },
                  { $lt: ["$updatedAt", todayStart] },
                ],
              },
              { $ifNull: ["$loan.disbursed", 0] },
              0,
            ],
          },
        },
      },
    },
  ];
}

function buildPartnerDashboardPipeline(bounds: DashboardDateBounds) {
  const { monthStart, lastMonthStart, lastMonthEnd } = bounds;

  return [
    {
      $group: {
        _id: null,
        totalPartners: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
        },
        partnersThisMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "active"] },
                  { $gte: ["$createdAt", monthStart] },
                ],
              },
              1,
              0,
            ],
          },
        },
        partnersLastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "active"] },
                  { $gte: ["$createdAt", lastMonthStart] },
                  { $lte: ["$createdAt", lastMonthEnd] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ];
}

function buildApplicationDashboardPipeline(bounds: DashboardDateBounds) {
  const { lastMonthStart, lastMonthEnd } = bounds;
  const pendingStatuses = [...PENDING_STATUSES];

  return [
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { student: null },
          { "student.recordType": { $ne: "lead" } },
          { "student.metadata.leadSource": { $ne: "website" } },
          { "student.metadata.promotionStatus": "promoted" },
        ],
      },
    },
    {
      $group: {
        _id: null,
        pendingApplications: {
          $sum: { $cond: [{ $in: ["$status", pendingStatuses] }, 1, 0] },
        },
        pendingLastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ["$status", pendingStatuses] },
                  { $gte: ["$updatedAt", lastMonthStart] },
                  { $lte: ["$updatedAt", lastMonthEnd] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ];
}

function mapDashboardCoreStats(
  studentRow: StudentDashboardAggregateRow | undefined,
  partnerRow: PartnerDashboardAggregateRow | undefined,
  applicationRow: ApplicationDashboardAggregateRow | undefined
): { metrics: DashboardMetrics; trends: DashboardMetricTrends } {
  const students = studentRow ?? ({} as StudentDashboardAggregateRow);
  const partners = partnerRow ?? ({} as PartnerDashboardAggregateRow);
  const applications = applicationRow ?? ({} as ApplicationDashboardAggregateRow);

  const metrics: DashboardMetrics = {
    totalStudents: students.totalStudents ?? 0,
    newStudentsToday: students.newStudentsToday ?? 0,
    totalPartners: partners.totalPartners ?? 0,
    pendingApplications: applications.pendingApplications ?? 0,
    sanctioned: students.sanctioned ?? 0,
    disbursed: students.disbursed ?? 0,
    rejected: students.rejected ?? 0,
    totalLoanAmount: students.totalLoanAmount ?? 0,
    todaysCollection: students.todaysCollection ?? 0,
  };

  const trends: DashboardMetricTrends = {
    totalStudents: formatMetricTrend(students.studentsThisMonth ?? 0, students.studentsLastMonth ?? 0),
    newStudentsToday: formatMetricTrend(students.studentsToday ?? 0, students.studentsYesterday ?? 0),
    totalPartners: formatMetricTrend(partners.partnersThisMonth ?? 0, partners.partnersLastMonth ?? 0),
    pendingApplications: formatMetricTrend(
      applications.pendingApplications ?? 0,
      applications.pendingLastMonth ?? 0
    ),
    sanctioned: formatMetricTrend(students.sanctionedThisMonth ?? 0, students.sanctionedLastMonth ?? 0),
    disbursed: formatMetricTrend(students.disbursedThisMonth ?? 0, students.disbursedLastMonth ?? 0),
    rejected: formatMetricTrend(students.rejectedThisMonth ?? 0, students.rejectedLastMonth ?? 0),
    totalLoanAmount: formatMetricTrend(students.loanThisMonth ?? 0, students.loanLastMonth ?? 0),
    todaysCollection: formatMetricTrend(students.collectionToday ?? 0, students.collectionYesterday ?? 0),
  };

  return { metrics, trends };
}

export interface DashboardCoreStats {
  metrics: DashboardMetrics;
  trends: DashboardMetricTrends;
}

export async function getDashboardCoreStats(): Promise<DashboardCoreStats> {
  await connectDB();
  const bounds = getDashboardDateBounds();

  const [studentRows, partnerRows, applicationRows] = await Promise.all([
    Student.aggregate<StudentDashboardAggregateRow>(buildStudentDashboardPipeline(bounds)),
    Partner.aggregate<PartnerDashboardAggregateRow>(buildPartnerDashboardPipeline(bounds)),
    Application.aggregate<ApplicationDashboardAggregateRow>(buildApplicationDashboardPipeline(bounds)),
  ]);

  return mapDashboardCoreStats(studentRows[0], partnerRows[0], applicationRows[0]);
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { metrics } = await getDashboardCoreStats();
  return metrics;
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
  const { trends } = await getDashboardCoreStats();
  return trends;
}

export async function getLoanStatusChart(): Promise<ChartDataPoint[]> {
  await connectDB();
  const results = await Student.aggregate([
    { $match: excludeAdmissionLeadsFilter() },
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
    {
      $match: {
        ...excludeAdmissionLeadsFilter(),
        createdAt: { $gte: startOfDay(sixMonthsAgo) },
      },
    },
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
    {
      $match: {
        ...excludeAdmissionLeadsFilter(),
        createdAt: { $gte: startOfDay(sixMonthsAgo) },
      },
    },
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

export async function getLatestStudents(limit = 5, user?: SessionUser | null) {
  await connectDB();
  const filter = mergeMongoFilter(
    excludeAdmissionLeadsFilter(),
    buildStudentVisibilityFilter(user)
  );
  return Student.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("partnerId", "companyName")
    .lean();
}

export async function getLatestPartners(limit = 5) {
  await connectDB();
  return Partner.find(officialPartnersFilter())
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getUpcomingFollowups(limit = 5, user?: SessionUser | null) {
  await connectDB();
  const now = new Date();
  const visibilityMatch = buildStudentVisibilityFilter(user);
  return Student.aggregate([
    {
      $match: mergeMongoFilter(excludeAdmissionLeadsFilter(), visibilityMatch),
    },
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
