/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: config => {
    config.externals.push('pino-pretty',          'lokijs', 'encoding')
    return config
    }
    transpilePackages: ['lucide-react'],
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
    ],
  },
}

module.exports = nextConfig
