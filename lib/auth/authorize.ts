import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { getPermissionsForRole } from "@/lib/auth/permissions";
import type { UserRole } from "@/types";

export async function authorizeCredentials(credentials: Record<string, unknown>) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  await connectDB();
  const user = await User.findOne({
    email: (credentials.email as string).toLowerCase(),
  });

  if (!user) return null;

  const isValid = await bcrypt.compare(
    credentials.password as string,
    user.passwordHash
  );
  if (!isValid) return null;

  if (!user.isVerified || user.status !== "active") {
    return null;
  }

  user.lastLogin = new Date();
  user.rememberMe = credentials.rememberMe === "true";
  await user.save();

  const role = user.role as UserRole;
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role,
    permissions: getPermissionsForRole(role),
    avatar: user.avatar,
    rememberMe: credentials.rememberMe === "true",
  };
}
