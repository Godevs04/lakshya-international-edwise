import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import { subMonths, startOfDay, format } from "date-fns";

export async function getConversionFunnel() {
  await connectDB();
  const statuses = [
    "new",
    "contacted",
    "documents_pending",
    "submitted",
    "under_verification",
    "approved",
    "sanctioned",
    "disbursed",
    "rejected",
  ];
  const results = await Student.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const map = new Map(results.map((r) => [r._id, r.count]));
  return statuses.map((s) => ({
    name: s.replace(/_/g, " "),
    value: map.get(s) ?? 0,
  }));
}

export async function getMonthlyRevenue() {
  await connectDB();
  const sixMonthsAgo = subMonths(new Date(), 5);
  const results = await Student.aggregate([
    {
      $match: {
        status: "disbursed",
        updatedAt: { $gte: startOfDay(sixMonthsAgo) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
        revenue: { $sum: { $ifNull: ["$loan.disbursed", 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return results.map((r) => ({
    name: format(new Date(r._id + "-01"), "MMM"),
    value: r.revenue,
  }));
}

export async function getLoanDistribution() {
  await connectDB();
  const ranges = [
    { label: "0-1L", min: 0, max: 100000 },
    { label: "1L-3L", min: 100000, max: 300000 },
    { label: "3L-5L", min: 300000, max: 500000 },
    { label: "5L-10L", min: 500000, max: 1000000 },
    { label: "10L+", min: 1000000, max: Infinity },
  ];
  const results = await Promise.all(
    ranges.map(async (range) => ({
      name: range.label,
      value: await Student.countDocuments({
        "loan.requested": { $gte: range.min, $lt: range.max === Infinity ? 999999999 : range.max },
      }),
    }))
  );
  return results;
}

export async function getStudentDemographics() {
  await connectDB();
  const [gender, states, courses] = await Promise.all([
    Student.aggregate([{ $group: { _id: "$gender", value: { $sum: 1 } } }]),
    Student.aggregate([
      { $match: { "address.state": { $exists: true, $ne: "" } } },
      { $group: { _id: "$address.state", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 10 },
    ]),
    Student.aggregate([
      { $match: { "education.course": { $exists: true, $ne: "" } } },
      { $group: { _id: "$education.course", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 8 },
    ]),
  ]);
  return {
    gender: gender.map((g) => ({ name: g._id || "Unknown", value: g.value })),
    states: states.map((s) => ({ name: s._id, value: s.value })),
    courses: courses.map((c) => ({ name: c._id, value: c.value })),
  };
}

export async function getPartnerPerformance() {
  await connectDB();
  return Partner.find({ status: "active" })
    .sort({ "performance.disbursementTotal": -1 })
    .limit(10)
    .select("companyName performance studentsCount totalLoanValue")
    .lean();
}

export async function getTrendData() {
  await connectDB();
  const sixMonthsAgo = subMonths(new Date(), 5);
  const results = await Student.aggregate([
    { $match: { createdAt: { $gte: startOfDay(sixMonthsAgo) } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        students: { $sum: 1 },
        loans: { $sum: { $ifNull: ["$loan.sanctioned", 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return results.map((r) => ({
    name: format(new Date(r._id + "-01"), "MMM"),
    students: r.students,
    loans: r.loans,
  }));
}

export async function getHeatMapData() {
  await connectDB();
  const results = await Student.aggregate([
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          day: { $dayOfWeek: "$createdAt" },
        },
        value: { $sum: 1 },
      },
    },
  ]);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return results.map((r) => ({
    month: r._id.month,
    day: days[(r._id.day - 1) % 7] ?? "Sun",
    value: r.value,
  }));
}
