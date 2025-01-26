import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://onyx-rho-pink.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://onyx-rho-pink.vercel.app/contact',
      lastModified: new Date(),
      changeFrequency: 'year',
      priority: 1,
    },

   {
      url: 'https://onyx-rho-pink.vercel.app/onboarding',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]
}