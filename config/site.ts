export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Resend-It",
  description:
    "Easy to use, gamified reusable packaging with blockchain and AI technology under the hood",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },

    { 
      title: "Account",
      href: "/account",
    },
    { 
      title: "Dashboard",
      href: "/dashboard",
    },
    { 
      title: "OpenAI",
      href: "/playground",
    },
    { 
      title: "Podcasts",
      href: "/music",
    },
    { 
      title: "Blog",
      href: "/blog",
    },
    { 
      title: "RBAC",
      href: "/dashboard/members",
    },
    {
      title: "Contact",
      href: "/contact",
    },
  ],
  links: {
    twitter: "https://twitter.com/resend-it",
    github: "https://github.com/resend-it",
    login: "https://onyx-rho-pink.vercel.app/auth",
    signup: "https://onyx-rho-pink.vercel.app/onboarding",
    resendit: "/",
    linkedin: "https://linkedin.com/in/resend-it",

  },
}
