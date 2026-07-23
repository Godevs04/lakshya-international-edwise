import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { DEFAULT_APP_LOGO } from "@/lib/brand/app-logo";

/** Renders the brand PNG into a square favicon / apple-touch icon. */
export async function createAppLogoIconResponse(size: number): Promise<ImageResponse> {
  const filename = DEFAULT_APP_LOGO.replace(/^\//, "");
  const logoBytes = await readFile(join(process.cwd(), "public", filename));
  const src = `data:image/png;base64,${logoBytes.toString("base64")}`;
  const pad = Math.round(size * 0.06);
  const inner = size - pad * 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <img
          src={src}
          width={inner}
          height={inner}
          alt=""
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { width: size, height: size }
  );
}
