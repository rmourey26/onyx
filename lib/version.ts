/**
 * Kronova Platform Version Tracking
 * (Formerly Resend-It)
 *
 * This file tracks the v0 workspace version deployed to production.
 * Update this file when deploying new versions to production.
 */

export const VERSION_INFO = {
  // v0 workspace version
  v0Version: "v88",

  // Semantic version for the application (2.0.0 marks the Kronova rebrand)
  appVersion: "2.0.0",

  // Last deployment timestamp
  lastDeployed: new Date().toISOString(),

  // Build/deployment environment
  environment: process.env.NODE_ENV || "development",

  // Feature flags based on version
  features: {
    assetTokenization: true,
    learningLayers: true,
    plaidIntegration: true,
    aetherNet: true,
    suiBlockchain: true,
    oauthInfrastructure: true,
  },

  // API version
  apiVersion: "v2.0.0",

  // Database schema version
  schemaVersion: "2.0.0",

  // Platform branding
  platformName: "Kronova",
  formerName: "Resend-It",
} as const

export type VersionInfo = typeof VERSION_INFO

/**
 * Get the current version information
 */
export function getVersion(): VersionInfo {
  return VERSION_INFO
}

/**
 * Get a formatted version string for display
 */
export function getVersionString(): string {
  return `v${VERSION_INFO.appVersion} (workspace: ${VERSION_INFO.v0Version})`
}

/**
 * Check if a specific feature is enabled in this version
 */
export function isFeatureEnabled(feature: keyof typeof VERSION_INFO.features): boolean {
  return VERSION_INFO.features[feature]
}
