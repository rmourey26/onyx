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
      title: "Members",
      href: "/dashboard",
    },
  ],
  links: {
    twitter: "https://twitter.com/r_mourey_jr",
    github: "https://github.com/rmourey26/onyx",
    login: "https://onyx-rho-pink.vercel.app/auth",
    signup: "https://onyx-rho-pink.vercel.app/auth-server-action",
  },
}