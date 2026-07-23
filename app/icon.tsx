import { createAppLogoIconResponse } from "@/lib/brand/create-app-logo-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
  return createAppLogoIconResponse(size.width);
}
