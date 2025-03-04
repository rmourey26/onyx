/** @type {import('next').NextConfig} */

const withPlugins = require("next-compose-plugins")
const withMDX = require('@next/mdx')()
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.supabase.co googleapis.com;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src *.supabase.co quantumone.b-cdn.net *.unsplash.com youtube.com;
  connect-src *;
  font-src 'self' googleapis.com;
  frame-src *.supabase.co youtube.com quantumone.b-cdn.net;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
]

const nextConfig = {
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  experimental: {
    mdxRs: true,
  },
    images : {
      remotePatterns: [
      {
        protocol: 'https',
        hostname: 'quantumone.b-cdn.net',
        port: '',
        pathname: '/onyx/**',
      },
      {
        protocol: 'https',
        hostname: 'unpkg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'youtube.com',
        port: '',
        pathname: '/embed/HR6a2aHhY_c?si=L2O3Cf7pQ-0HHhsP',
      },

      {
        protocol: 'https',
        hostname: 'quantumone.b-cdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },

      {

        protocol: 'https',
        hostname: 'api.web3modal.com',
        port: '',
      
      },
    ],
  },
   async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ]
    },


   pageExtensions: ['ts', 'tsx', 'mdx', 'js', 'jsx', 'rs'],
}

module.exports = withMDX(nextConfig)

