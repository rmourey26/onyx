/** @type {import('next').NextConfig} */

const withPlugins = require("next-compose-plugins")
const withMDX = require('@next/mdx')()
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    `

const nextConfig = {
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ]
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

   pageExtensions: ['ts', 'tsx', 'mdx', 'js', 'jsx'],
}

module.exports = withMDX(nextConfig)

