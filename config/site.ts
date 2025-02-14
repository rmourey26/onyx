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
    twitter: "https://twitter.com/r_mourey_jr",
    github: "https://github.com/rmourey26/onyx",
    login: "https://onyx-rho-pink.vercel.app/auth",
    signup: "https://onyx-rho-pink.vercel.app/onboarding",
  },
}
