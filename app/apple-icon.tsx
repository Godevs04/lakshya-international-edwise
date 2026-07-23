import { createAppLogoIconResponse } from "@/lib/brand/create-app-logo-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return createAppLogoIconResponse(size.width);
}
