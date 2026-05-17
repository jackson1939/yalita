import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yalita — Identidad Financiera",
    short_name: "Yalita",
    description: "Tu reputación es tu mayor activo. Crédito justo sin banco.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1E2235",
    theme_color: "#1E2235",
    categories: ["finance", "utilities"],
    lang: "es",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
