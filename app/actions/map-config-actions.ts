"use server"

/**
 * Server Actions for Map Configuration
 * Securely provides map tokens and configuration without exposing sensitive data to client
 */

export async function getMapConfig() {
  "use server"
  
  const mapboxToken = process.env.MAPBOX_TOKEN
  
  if (!mapboxToken) {
    return {
      enabled: false,
      provider: "none" as const,
      message: "Map visualization not configured",
    }
  }

  return {
    enabled: true,
    provider: "mapbox" as const,
    token: mapboxToken,
    style: "mapbox://styles/mapbox/dark-v11",
    center: [-95.7129, 37.0902] as [number, number], // Center of US
    zoom: 4,
  }
}

export type MapConfig = Awaited<ReturnType<typeof getMapConfig>>
