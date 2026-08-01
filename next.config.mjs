import { createRequire } from "module"
const require = createRequire(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          // Allow microphone access on all pages (required for voice NLP)
          {
            key: "Permissions-Policy",
            value: "microphone=(self), camera=(), geolocation=()",
          },
          // Legacy Feature-Policy for older Android/Samsung Browser compatibility
          {
            key: "Feature-Policy",
            value: "microphone 'self'",
          },
          // Allow blob: URIs for MediaRecorder audio chunks and data: for inline assets
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              // blob: required for MediaRecorder .ondataavailable chunks
              "media-src 'self' blob: https:",
              "connect-src 'self' https: wss:",
              "font-src 'self' https: data:",
              "frame-src 'self' https:",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ]
  },
  transpilePackages: ["@mysten/dapp-kit", "@mysten/sui", "@mysten/bcs"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack(config) {
    // Pin all @mysten/bcs imports to the single root v2 copy so that nested
    // legacy copies (wallet-kit-core → sui.js → bcs@0.9/1.x) are never bundled.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@mysten/bcs": require.resolve("@mysten/bcs"),
    }

    // Apply the module-resolver loader to every @mysten package so that
    // legacy @mysten/sui.js imports, deprecated class names, and old function
    // names (fromB64 → fromBase64, SuiClient → SuiJsonRpcClient, etc.) are
    // rewritten at bundle time regardless of where they originate.
    config.module.rules.push({
      test: /\.m?[jt]sx?$/,
      include: /node_modules\/@mysten/,
      use: [
        {
          loader: require.resolve("./module-resolver.js"),
        },
      ],
    })

    return config
  },
}

export default nextConfig
