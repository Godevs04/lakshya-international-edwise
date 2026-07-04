import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import {
  websitePendingPartnerLeadsFilter,
  websitePendingStudentLeadsFilter,
} from "@/lib/constants/site-leads";

export async function getSiteLeadInboxCounts() {
  await connectDB();

  const [students, partners] = await Promise.all([
    Student.countDocuments(websitePendingStudentLeadsFilter()),
    Partner.countDocuments(websitePendingPartnerLeadsFilter()),
  ]);

  return { students, partners, total: students + partners };
}
