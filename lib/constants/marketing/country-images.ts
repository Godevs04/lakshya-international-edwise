/** Local iconic destination photos — stored in public/countries/images/ */
export const COUNTRY_IMAGE_MAP: Record<string, { src: string; alt: string }> = {
  usa: {
    src: "/countries/images/usa.jpg",
    alt: "New York City skyline at sunset — study in the USA",
  },
  canada: {
    src: "/countries/images/canada.jpg",
    alt: "Canadian Rockies and turquoise lake — study in Canada",
  },
  uk: {
    src: "/countries/images/uk.jpg",
    alt: "London cityscape with Thames — study in the United Kingdom",
  },
  australia: {
    src: "/countries/images/australia.jpg",
    alt: "Sydney Harbour and Opera House — study in Australia",
  },
  germany: {
    src: "/countries/images/germany.jpg",
    alt: "Historic European architecture — study in Germany",
  },
  ireland: {
    src: "/countries/images/ireland.jpg",
    alt: "Irish coastal cliffs and green landscape — study in Ireland",
  },
  france: {
    src: "/countries/images/france.jpg",
    alt: "Eiffel Tower and Paris skyline — study in France",
  },
  "new-zealand": {
    src: "/countries/images/new-zealand.jpg",
    alt: "New Zealand mountains and lake — study in New Zealand",
  },
  dubai: {
    src: "/countries/images/dubai.jpg",
    alt: "Dubai skyline with Burj Khalifa — study in Dubai",
  },
  europe: {
    src: "/countries/images/europe.jpg",
    alt: "European cityscape at golden hour — study in Europe",
  },
};

export function getCountryImage(slug: string): { src: string; alt: string } | undefined {
  return COUNTRY_IMAGE_MAP[slug];
}
