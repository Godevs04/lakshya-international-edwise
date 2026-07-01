import { describe, expect, it } from "vitest";
import {
  getGoogleMapsDirectionsUrl,
  parseGoogleMapsEmbedCenter,
  parseGoogleMapsEmbedUrl,
} from "@/lib/utils/google-maps-embed";

describe("google maps embed utils", () => {
  it("parses a raw Google Maps embed URL", () => {
    const url =
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124445!2d77.57!3d12.91";
    expect(parseGoogleMapsEmbedUrl(url)).toBe(url);
  });

  it("parses embed src from iframe HTML", () => {
    const iframe =
      '<iframe src="https://www.google.com/maps/embed?pb=abc123" width="600" height="450"></iframe>';
    expect(parseGoogleMapsEmbedUrl(iframe)).toBe("https://www.google.com/maps/embed?pb=abc123");
  });

  it("extracts map center coordinates from embed URLs", () => {
    const url =
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124445!2d77.5700559!3d12.9129613";
    expect(parseGoogleMapsEmbedCenter(url)).toEqual([77.5700559, 12.9129613]);
  });

  it("builds a directions URL from an address", () => {
    expect(getGoogleMapsDirectionsUrl("Fathima mansion, Bengaluru")).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=Fathima%20mansion%2C%20Bengaluru"
    );
  });
});
