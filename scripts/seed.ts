import "./load-env";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { getMongoUri } from "@/lib/config/env";
import { getDefaultSettings, getSeedAdminName } from "@/lib/config/app-defaults";
import { User } from "@/models/User";
import { Role } from "@/models/Role";
import { Settings } from "@/models/Settings";
import { ROLE_PERMISSIONS, ROLE_LABELS } from "@/lib/constants/permissions";
import type { UserRole } from "@/types";

async function seed() {
  try {
    getMongoUri();
  } catch {
    console.error("MONGODB_URI is required in .env.local");
    process.exit(1);
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required in .env.local");
    process.exit(1);
  }

  await connectDB();
  console.log("Connected to MongoDB");

  for (const roleName of Object.keys(ROLE_PERMISSIONS) as UserRole[]) {
    await Role.findOneAndUpdate(
      { name: roleName },
      {
        name: roleName,
        label: ROLE_LABELS[roleName],
        permissions: ROLE_PERMISSIONS[roleName],
      },
      { upsert: true, returnDocument: "after" }
    );
    console.log(`Role seeded: ${roleName}`);
  }

  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    await Settings.create(getDefaultSettings());
    console.log("Default settings created from .env.local");
  }

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await User.create({
      email: adminEmail.toLowerCase(),
      passwordHash,
      name: getSeedAdminName(),
      role: "super_admin",
      isVerified: true,
      status: "active",
    });
    console.log(`Super Admin created: ${adminEmail}`);
  } else {
    console.log("Super Admin already exists");
  }

  console.log("Seed completed successfully");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
