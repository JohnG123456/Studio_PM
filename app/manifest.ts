import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Studio PM — 14 Contour Rd",
    short_name: "Studio PM",
    description:
      "Platform of record for the studio build: budget, stages, dependencies, and decisions.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0b08",
    theme_color: "#0f0b08",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
