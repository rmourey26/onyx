import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kronova Intelligent Systems",
    short_name: "Kronova",
    description:
      "The world's most advanced Vertical AI Agent Platform. Built on AetherNet and AetherChain, Kronova provides a unified foundation for any industry. AetherNet's secure AI agents standardize intelligent communication. AetherChain offers an immutable trust layer. Together with our AI Business Suite, we deliver unprecedented efficiency, measurable ROI, and verifiable automation.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0047AB",
    icons: [
      {
        src: "/logos/kronova-logo-icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/logos/kronova-logo-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  }
}
