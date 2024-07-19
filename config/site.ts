export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Onyx",
  description:
    "Embedded systems",
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