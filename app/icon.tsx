import { ImageResponse } from "next/og";
import { getAppConfig } from "@/lib/config/app-config";
import { FaviconMark, getBrandInitial } from "@/lib/brand/favicon-mark";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
  const config = await getAppConfig();
  const initial = getBrandInitial(config.company.name);

  return new ImageResponse(<FaviconMark initial={initial} size={512} />, {
    ...size,
  });
}
