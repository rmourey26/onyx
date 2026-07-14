// Environment variables configuration
export const config = {
  // App URLs
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",

  // Seeding
  seedUserId: process.env.SEED_USER_ID || "",

  // Network
  suiNetwork: process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet",
}

export type SiteConfig = {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
  mainNav: {
    title: string
    href: string
    disabled?: boolean
  }[]
}

export const siteConfig: SiteConfig = {
  name: "Kronova",
  description:
    "The world's most advanced Vertical AI Agent Platform - Build and deploy autonomous teams of AI agents with unprecedented efficiency and automation",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://kronova.ai",
  ogImage: "https://kronova.ai/og.jpg",
  links: {
    twitter: "https://twitter.com/kronovaai",
    github: "https://github.com/kronova/platform",
  },
  mainNav: [
    {
      title: "Features",
      href: "/#features",
    },
    {
      title: "Ecosystem",
      href: "/ecosystem",
    },
    {
      title: "API Docs",
      href: "/api-docs",
    },
    {
      title: "About",
      href: "/about",
    },
  ],
}

// Helper function to get absolute URLs
export function getAbsoluteUrl(path: string): string {
  const baseUrl = siteConfig.url
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}
