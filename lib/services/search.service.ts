import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import { Application } from "@/models/Application";
import type { SearchResult } from "@/types";

export async function globalSearch(query: string, limit = 10): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  await connectDB();
  const trimmed = query.trim();
  const regex = new RegExp(trimmed, "i");

  const [students, partners, applications] = await Promise.all([
    Student.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { phone: regex },
        { email: regex },
        { studentId: regex },
        { "loan.applicationNumber": regex },
      ],
    })
      .limit(limit)
      .select("studentId firstName lastName phone email status")
      .lean(),
    Partner.find({
      $or: [
        { companyName: regex },
        { owner: regex },
        { phone: regex },
        { email: regex },
        { gst: regex },
      ],
    })
      .limit(limit)
      .select("companyName owner phone email status")
      .lean(),
    Application.find()
      .populate("studentId", "firstName lastName studentId")
      .limit(limit)
      .lean(),
  ]);

  const results: SearchResult[] = [];

  for (const s of students) {
    results.push({
      type: "student",
      id: s._id.toString(),
      title: `${s.firstName} ${s.lastName}`,
      subtitle: s.studentId,
      href: `/dashboard/students/${s._id}`,
    });
  }

  for (const p of partners) {
    results.push({
      type: "partner",
      id: p._id.toString(),
      title: p.companyName,
      subtitle: p.owner ?? p.phone ?? "",
      href: `/dashboard/partners/${p._id}`,
    });
  }

  for (const a of applications) {
    const student = a.studentId as unknown as {
      _id: string;
      firstName: string;
      lastName: string;
      studentId: string;
    } | null;
    if (student && regex.test(`${student.firstName} ${student.lastName} ${student.studentId}`)) {
      results.push({
        type: "application",
        id: a._id.toString(),
        title: `${student.firstName} ${student.lastName}`,
        subtitle: `Application - ${a.status}`,
        href: `/dashboard/applications`,
      });
    }
  }

  return results.slice(0, limit);
}
