import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { resolveUserPermissions } from "@/lib/auth/permissions";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { UserRole } from "@/types";

export async function authorizeCredentials(credentials: Record<string, unknown>) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const email = (credentials.email as string).toLowerCase();
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit("login", `${ip}:${email}`);
  if (!rateLimit.allowed) {
    return null;
  }

  await connectDB();
  const user = await User.findOne({ email });

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
    permissions: resolveUserPermissions(
      role,
      user.useCustomPermissions,
      user.customPermissions
    ),
    avatar: user.avatar,
    rememberMe: credentials.rememberMe === "true",
  };
}
