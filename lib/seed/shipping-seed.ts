import { v4 as uuidv4 } from "uuid"
import type { Database } from "@/lib/supabase/database.types"

// Define types based on the database schema
type ShippingInsert = Database["public"]["Tables"]["shipping"]["Insert"]
type ReusablePackageInsert = Database["public"]["Tables"]["reusable_packages"]["Insert"]

// Function to generate a random date within the last year
export function randomDate(start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), end = new Date()): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

// Generate a reusable package that matches the database schema
export function generateReusablePackage(index: number): ReusablePackageInsert {
  const packageTypes = [
    { name: "Standard Box", material: "Cardboard" },
    { name: "Insulated Container", material: "EPS Foam" },
    { name: "Plastic Tote", material: "HDPE Plastic" },
    { name: "Fabric Bag", material: "Recycled Polyester" },
    { name: "Wooden Crate", material: "Pine Wood" },
    { name: "Pallet Box", material: "Composite" },
    { name: "Mesh Container", material: "Steel Mesh" },
    { name: "Vacuum Pack", material: "Multi-layer Film" },
  ]

  const packageType = packageTypes[Math.floor(Math.random() * packageTypes.length)]
  const statuses = ["available", "in_use", "damaged", "maintenance"]
  const status = Math.random() > 0.6 ? "available" : statuses[Math.floor(Math.random() * statuses.length)]

  const dimensions = {
    length: Math.round(Math.random() * 100 + 20), // 20 to 120 cm
    width: Math.round(Math.random() * 80 + 15), // 15 to 95 cm
    height: Math.round(Math.random() * 60 + 10), // 10 to 70 cm
    unit: "cm",
  }

  const weightCapacity = Math.round((Math.random() * 50 + 5) * 10) / 10 // 5 to 55 kg
  const purchaseDate = randomDate(new Date(Date.now() - 730 * 24 * 60 * 60 * 1000)) // Up to 2 years ago
  const reuseCount = Math.floor(Math.random() * 50) // 0 to 49 reuses
  const expectedLifetime = Math.floor(Math.random() * 100 + 50) // 50 to 149 reuses

  // Generate IoT capability for some packages
  const hasIoT = Math.random() > 0.5
  const iotData = hasIoT
    ? {
        sensor_type: ["temperature", "humidity", "shock", "location"][Math.floor(Math.random() * 4)],
        battery_level: Math.floor(Math.random() * 100),
        last_maintenance: randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)),
      }
    : null

  // Generate a unique package tracking code
  const packageId = `PKG-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}-${index.toString().padStart(3, "0")}`

  return {
    id: uuidv4(),
    package_id: packageId,
    name: `${packageType.name} #${index + 1}`,
    description: `${packageType.material} package for sustainable shipping`,
    dimensions: dimensions,
    weight_capacity: weightCapacity,
    material: packageType.material,
    reuse_count: reuseCount,
    status: status,
    location_id: null,
    metadata: {
      manufacturer: ["EcoPackage", "GreenShip", "SustainBox", "ReusePack"][Math.floor(Math.random() * 4)],
      purchase_date: purchaseDate,
      expected_lifetime: expectedLifetime,
      iot_data: iotData,
    },
    created_at: randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)), // Within last 6 months
    updated_at: new Date().toISOString(),
    iot_sensor_id: hasIoT ? `IOT-${Math.floor(Math.random() * 10000)}` : null, // 30% have IoT sensors
  }
}

// Generate location tracking data
function generateLocationHistory(
  shippingDate: string,
  deliveryDate: string | null,
  originCountry: string,
  destinationCountry: string,
) {
  const locations = []
  const startDate = new Date(shippingDate)
  const endDate = deliveryDate
    ? new Date(deliveryDate)
    : new Date(new Date(shippingDate).getTime() + 7 * 24 * 60 * 60 * 1000)
  const totalDuration = endDate.getTime() - startDate.getTime()

  // Generate between 5-20 location points
  const numPoints = Math.floor(Math.random() * 15) + 5

  for (let i = 0; i < numPoints; i++) {
    const timestamp = new Date(startDate.getTime() + totalDuration * (i / (numPoints - 1))).toISOString()

    // Generate points along a route (simplified)
    const progress = i / (numPoints - 1)
    const lat = interpolateCoordinate(
      getRandomCoordinate(originCountry, "lat"),
      getRandomCoordinate(destinationCountry, "lat"),
      progress,
    )
    const lng = interpolateCoordinate(
      getRandomCoordinate(originCountry, "lng"),
      getRandomCoordinate(destinationCountry, "lng"),
      progress,
    )

    locations.push({
      timestamp,
      latitude: lat,
      longitude: lng,
      accuracy: Math.round(Math.random() * 50) + 5, // 5-55m accuracy
      facility_type:
        i === 0
          ? "origin"
          : i === numPoints - 1
            ? "destination"
            : ["transit_center", "sorting_facility", "customs", "delivery_vehicle"][Math.floor(Math.random() * 4)],
    })
  }

  return locations
}

// Helper functions for location generation
function getRandomCoordinate(country: string, type: string) {
  // Simplified country coordinate ranges
  const coordinates: Record<string, Record<string, number[]>> = {
    US: { lat: [25, 48], lng: [-125, -70] },
    CA: { lat: [43, 60], lng: [-130, -60] },
    UK: { lat: [50, 58], lng: [-8, 2] },
    DE: { lat: [47, 55], lng: [6, 15] },
    FR: { lat: [42, 51], lng: [-5, 8] },
    JP: { lat: [30, 45], lng: [130, 145] },
    AU: { lat: [-43, -10], lng: [113, 153] },
  }

  // Default to US if country not found
  const countryCoords = coordinates[country] || coordinates.US
  const range = countryCoords[type]
  return range[0] + Math.random() * (range[1] - range[0])
}

function interpolateCoordinate(start: number, end: number, progress: number) {
  return start + (end - start) * progress
}

// Generate sensor readings
function generateSensorReadings(shippingDate: string, deliveryDate: string | null, isRefrigerated: boolean) {
  const readings = []
  const startDate = new Date(shippingDate)
  const endDate = deliveryDate
    ? new Date(deliveryDate)
    : new Date(new Date(shippingDate).getTime() + 7 * 24 * 60 * 60 * 1000)
  const totalDuration = endDate.getTime() - startDate.getTime()

  // Generate between 20-100 sensor readings
  const numReadings = Math.floor(Math.random() * 80) + 20

  // Base values and variation ranges for different sensor types
  const baseTemp = isRefrigerated ? -5 + Math.random() * 10 : 15 + Math.random() * 10
  const baseHumidity = 40 + Math.random() * 30
  const basePressure = 1000 + Math.random() * 30

  for (let i = 0; i < numReadings; i++) {
    const timestamp = new Date(startDate.getTime() + totalDuration * (i / (numReadings - 1))).toISOString()

    // Add some random variation to readings
    const tempVariation = (Math.random() * 2 - 1) * (isRefrigerated ? 2 : 5)
    const humidityVariation = (Math.random() * 2 - 1) * 10
    const pressureVariation = (Math.random() * 2 - 1) * 5

    // Occasionally add a shock event
    const hasShockEvent = Math.random() > 0.9 // 10% chance of shock event

    readings.push({
      timestamp,
      temperature: {
        value: baseTemp + tempVariation,
        unit: "celsius",
      },
      humidity: {
        value: baseHumidity + humidityVariation,
        unit: "percent",
      },
      pressure: {
        value: basePressure + pressureVariation,
        unit: "hPa",
      },
      shock: {
        value: hasShockEvent ? 5 + Math.random() * 15 : Math.random() * 2,
        unit: "g",
      },
      light: {
        value: Math.random() * 1000,
        unit: "lux",
      },
      battery: {
        value: 100 - (i / numReadings) * (20 + Math.random() * 30), // Battery decreases over time
        unit: "percent",
      },
    })
  }

  return readings
}

// Generate shipping data with optional package assignment
export function generateShippingData(availablePackageIds: string[] = []): ShippingInsert {
  const carriers = ["FedEx", "UPS", "USPS", "DHL", "Amazon Logistics"]
  const statuses = ["delivered", "in_transit", "processing", "delayed", "returned"]
  const countries = ["US", "CA", "UK", "DE", "FR", "JP", "AU"]
  const serviceLevels = ["Standard", "Express", "Priority", "Economy"]

  const carrier = carriers[Math.floor(Math.random() * carriers.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const originCountry = countries[Math.floor(Math.random() * countries.length)]
  const destinationCountry = countries[Math.floor(Math.random() * countries.length)]
  const serviceLevel = serviceLevels[Math.floor(Math.random() * serviceLevels.length)]

  const trackingNumber = `${carrier.substring(0, 2)}${Math.floor(Math.random() * 10000000000)}`
  const weight = Math.round((Math.random() * 50 + 0.5) * 100) / 100 // 0.5 to 50.5 kg

  const dimensions = {
    length: Math.round(Math.random() * 100 + 5), // 5 to 105 cm
    width: Math.round(Math.random() * 50 + 5), // 5 to 55 cm
    height: Math.round(Math.random() * 50 + 5), // 5 to 55 cm
    unit: "cm",
  }

  const shippingDate = randomDate()
  const estimatedDelivery = new Date(
    new Date(shippingDate).getTime() + (Math.random() * 10 + 1) * 24 * 60 * 60 * 1000,
  ).toISOString()
  const actualDelivery =
    status === "delivered"
      ? new Date(new Date(estimatedDelivery).getTime() + (Math.random() * 4 - 2) * 24 * 60 * 60 * 1000).toISOString()
      : null

  // Assign packages if available
  let packageIds: string[] | null = null
  if (availablePackageIds.length > 0 && Math.random() > 0.3) {
    // 70% chance to use packages
    const numPackages = Math.floor(Math.random() * 3) + 1 // Use 1-3 packages
    packageIds = []

    // Create a copy of the array to avoid modifying the original
    const availableIds = [...availablePackageIds]

    for (let i = 0; i < numPackages && availableIds.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableIds.length)
      packageIds.push(availableIds[randomIndex])
      // Remove the selected ID to avoid duplicates
      availableIds.splice(randomIndex, 1)
    }
  }

  // Generate IoT sensor data
  const isIoTEnabled = Math.random() > 0.3 // 70% of shipments have IoT sensors

  // Determine if the shipment is refrigerated
  const isRefrigerated = Math.random() > 0.7 // 30% are refrigerated

  // Generate IoT data
  const iotSensorId = isIoTEnabled ? `IOT-${Math.floor(Math.random() * 1000000)}` : null

  // Create the shipping record that matches the database schema
  const shippingRecord: ShippingInsert = {
    id: uuidv4(),
    tracking_number: trackingNumber,
    status,
    carrier,
    weight,
    origin_address: {
      name: `Sender in ${originCountry}`,
      street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
      city: `City in ${originCountry}`,
      state: `State in ${originCountry}`,
      zip: `${Math.floor(Math.random() * 99999) + 10000}`,
      country: originCountry,
    },
    destination_address: {
      name: `Recipient in ${destinationCountry}`,
      street: `${Math.floor(Math.random() * 9999) + 1} Delivery Ave`,
      city: `City in ${destinationCountry}`,
      state: `State in ${destinationCountry}`,
      zip: `${Math.floor(Math.random() * 99999) + 10000}`,
      country: destinationCountry,
    },
    package_ids: packageIds,
    shipping_date: shippingDate,
    estimated_delivery: estimatedDelivery,
    actual_delivery: actualDelivery,
    service_level: serviceLevel,
    iot_sensor_id: iotSensorId,
    public_id: uuidv4().substring(0, 8),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // If IoT is enabled, generate the IoT data and store it in the database
  if (isIoTEnabled) {
    const locationTracking = generateLocationHistory(shippingDate, actualDelivery, originCountry, destinationCountry)
    const sensorReadings = generateSensorReadings(shippingDate, actualDelivery, isRefrigerated)

    // Generate alerts based on sensor readings
    const alerts = []

    if (sensorReadings) {
      // Check for temperature excursions
      const tempReadings = sensorReadings.map((r: any) => r.temperature.value)
      const maxTemp = Math.max(...tempReadings)

      if (isRefrigerated && maxTemp > 8) {
        alerts.push({
          type: "temperature_excursion",
          severity: "high",
          timestamp: sensorReadings.find((r: any) => r.temperature.value === maxTemp).timestamp,
          message: `Temperature exceeded safe range: ${maxTemp.toFixed(1)}°C`,
          threshold: 8,
        })
      }

      // Check for shock events
      const shockEvents = sensorReadings.filter((r: any) => r.shock.value > 5)
      if (shockEvents.length > 0) {
        shockEvents.forEach((event: any) => {
          alerts.push({
            type: "impact_detected",
            severity: event.shock.value > 10 ? "high" : "medium",
            timestamp: event.timestamp,
            message: `Impact of ${event.shock.value.toFixed(1)}g detected`,
            threshold: 5,
          })
        })
      }

      // Check for battery issues
      const lastReading = sensorReadings[sensorReadings.length - 1]
      if (lastReading.battery.value < 20) {
        alerts.push({
          type: "low_battery",
          severity: "low",
          timestamp: lastReading.timestamp,
          message: `Low battery: ${lastReading.battery.value.toFixed(1)}%`,
          threshold: 20,
        })
      }
    }

    // Store IoT data in a format compatible with the database schema
    const iotData = {
      device_id: iotSensorId,
      sensor_type: ["basic", "advanced", "premium"][Math.floor(Math.random() * 3)],
      location_tracking: locationTracking,
      sensor_readings: sensorReadings,
      alerts: alerts,
      is_refrigerated: isRefrigerated,
    }

    // We'll store this as JSON in the database
    // Note: In a real application, you might want to normalize this data into separate tables
    shippingRecord.dimensions = dimensions
  }

  return shippingRecord
}
