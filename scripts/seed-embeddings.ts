import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Function to generate a random embedding vector with 1536 dimensions
function generateRandomEmbedding(dimensions = 1536): number[] {
  const embedding = []
  for (let i = 0; i < dimensions; i++) {
    // Generate values between -1 and 1, which is typical for normalized embeddings
    embedding.push(Math.random() * 2 - 1)
  }
  return embedding
}

// Function to generate a random date within the last year
function randomDate(start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), end = new Date()): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

// Update the generateShippingData function to include IoT sensor data
function generateShippingData() {
  const carriers = ["FedEx", "UPS", "USPS", "DHL", "Amazon Logistics"]
  const statuses = ["delivered", "in_transit", "processing", "delayed", "returned"]
  const countries = ["US", "CA", "UK", "DE", "FR", "JP", "AU"]

  const carrier = carriers[Math.floor(Math.random() * carriers.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const originCountry = countries[Math.floor(Math.random() * countries.length)]
  const destinationCountry = countries[Math.floor(Math.random() * countries.length)]

  const trackingNumber = `${carrier.substring(0, 2)}${Math.floor(Math.random() * 10000000000)}`
  const weight = Math.round((Math.random() * 50 + 0.5) * 100) / 100 // 0.5 to 50.5 kg
  const shippingCost = Math.round((Math.random() * 200 + 5) * 100) / 100 // $5 to $205

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

  // Generate IoT sensor data
  const isIoTEnabled = Math.random() > 0.3 // 70% of shipments have IoT sensors

  // Generate location tracking data
  const generateLocationHistory = () => {
    const locations = []
    const startDate = new Date(shippingDate)
    const endDate = actualDelivery ? new Date(actualDelivery) : new Date(estimatedDelivery)
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

  // Generate sensor readings
  const generateSensorReadings = () => {
    if (!isIoTEnabled) return null

    const readings = []
    const startDate = new Date(shippingDate)
    const endDate = actualDelivery ? new Date(actualDelivery) : new Date(estimatedDelivery)
    const totalDuration = endDate.getTime() - startDate.getTime()

    // Generate between 20-100 sensor readings
    const numReadings = Math.floor(Math.random() * 80) + 20

    // Base values and variation ranges for different sensor types
    const isRefrigerated = Math.random() > 0.7 // 30% are refrigerated
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

  // Helper functions for location generation
  function getRandomCoordinate(country, type) {
    // Simplified country coordinate ranges
    const coordinates = {
      US: { lat: [25, 48], lng: [-125, -70] },
      CA: { lat: [43, 60], lng: [-130, -60] },
      UK: { lat: [50, 58], lng: [-8, 2] },
      DE: { lat: [47, 55], lng: [6, 15] },
      FR: { lat: [42, 51], lng: [-5, 8] },
      JP: { lat: [30, 45], lng: [130, 145] },
      AU: { lat: [-43, -10], lng: [113, 153] },
    }

    const range = coordinates[country][type]
    return range[0] + Math.random() * (range[1] - range[0])
  }

  function interpolateCoordinate(start, end, progress) {
    return start + (end - start) * progress
  }

  // Generate IoT data
  const isRefrigerated = Math.random() > 0.7 // 30% are refrigerated
  const iotData = isIoTEnabled
    ? {
        device_id: `IOT-${Math.floor(Math.random() * 1000000)}`,
        sensor_type: ["basic", "advanced", "premium"][Math.floor(Math.random() * 3)],
        location_tracking: generateLocationHistory(),
        sensor_readings: generateSensorReadings(),
        alerts: [],
        is_refrigerated: isRefrigerated,
      }
    : null

  // Generate alerts based on sensor readings
  if (iotData && iotData.sensor_readings) {
    // Check for temperature excursions
    const tempReadings = iotData.sensor_readings.map((r) => r.temperature.value)
    const maxTemp = Math.max(...tempReadings)
    const minTemp = Math.min(...tempReadings)

    if (iotData.is_refrigerated && maxTemp > 8) {
      iotData.alerts.push({
        type: "temperature_excursion",
        severity: "high",
        timestamp: iotData.sensor_readings.find((r) => r.temperature.value === maxTemp).timestamp,
        message: `Temperature exceeded safe range: ${maxTemp.toFixed(1)}°C`,
        threshold: 8,
      })
    }

    // Check for shock events
    const shockEvents = iotData.sensor_readings.filter((r) => r.shock.value > 5)
    if (shockEvents.length > 0) {
      shockEvents.forEach((event) => {
        iotData.alerts.push({
          type: "impact_detected",
          severity: event.shock.value > 10 ? "high" : "medium",
          timestamp: event.timestamp,
          message: `Impact of ${event.shock.value.toFixed(1)}g detected`,
          threshold: 5,
        })
      })
    }

    // Check for battery issues
    const lastReading = iotData.sensor_readings[iotData.sensor_readings.length - 1]
    if (lastReading.battery.value < 20) {
      iotData.alerts.push({
        type: "low_battery",
        severity: "low",
        timestamp: lastReading.timestamp,
        message: `Low battery: ${lastReading.battery.value.toFixed(1)}%`,
        threshold: 20,
      })
    }
  }

  return {
    tracking_number: trackingNumber,
    status,
    carrier,
    weight,
    dimensions,
    shipping_cost: shippingCost,
    currency: "USD",
    shipping_date: shippingDate,
    estimated_delivery: estimatedDelivery,
    actual_delivery: actualDelivery,
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
    iot_data: iotData,
  }
}

// Update the createShippingDescription function to include IoT sensor data
function createShippingDescription(shippingData: any): string {
  let description = `
    Tracking Number: ${shippingData.tracking_number}
    Status: ${shippingData.status}
    Carrier: ${shippingData.carrier}
    Origin: ${shippingData.origin_address.street}, ${shippingData.origin_address.city}, ${shippingData.origin_address.state}, ${shippingData.origin_address.country}
    Destination: ${shippingData.destination_address.street}, ${shippingData.destination_address.city}, ${shippingData.destination_address.state}, ${shippingData.destination_address.country}
    Weight: ${shippingData.weight} kg
    Dimensions: ${shippingData.dimensions.length}x${shippingData.dimensions.width}x${shippingData.dimensions.height} ${shippingData.dimensions.unit}
    Shipping Cost: $${shippingData.shipping_cost} ${shippingData.currency}
    Shipping Date: ${shippingData.shipping_date}
    Estimated Delivery: ${shippingData.estimated_delivery}
    ${shippingData.actual_delivery ? `Actual Delivery: ${shippingData.actual_delivery}` : ""}
  `.trim()

  // Add IoT data if available
  if (shippingData.iot_data) {
    description += `\n    IoT Device ID: ${shippingData.iot_data.device_id}`
    description += `\n    Sensor Type: ${shippingData.iot_data.sensor_type}`

    if (shippingData.iot_data.is_refrigerated) {
      description += `\n    Refrigerated Shipment: Yes`
    }

    // Add location tracking summary
    if (shippingData.iot_data.location_tracking && shippingData.iot_data.location_tracking.length > 0) {
      description += `\n    Location Tracking: ${shippingData.iot_data.location_tracking.length} points recorded`

      // Add the last known location
      const lastLocation = shippingData.iot_data.location_tracking[shippingData.iot_data.location_tracking.length - 1]
      description += `\n    Last Location: Lat ${lastLocation.latitude.toFixed(4)}, Lng ${lastLocation.longitude.toFixed(4)} at ${lastLocation.timestamp}`
    }

    // Add sensor readings summary
    if (shippingData.iot_data.sensor_readings && shippingData.iot_data.sensor_readings.length > 0) {
      const readings = shippingData.iot_data.sensor_readings

      // Calculate min, max, avg temperature
      const temperatures = readings.map((r) => r.temperature.value)
      const minTemp = Math.min(...temperatures)
      const maxTemp = Math.max(...temperatures)
      const avgTemp = temperatures.reduce((sum, val) => sum + val, 0) / temperatures.length

      description += `\n    Temperature Range: ${minTemp.toFixed(1)}°C to ${maxTemp.toFixed(1)}°C (avg: ${avgTemp.toFixed(1)}°C)`

      // Add humidity info
      const humidities = readings.map((r) => r.humidity.value)
      const avgHumidity = humidities.reduce((sum, val) => sum + val, 0) / humidities.length
      description += `\n    Average Humidity: ${avgHumidity.toFixed(1)}%`

      // Add shock events
      const shockEvents = readings.filter((r) => r.shock.value > 5)
      if (shockEvents.length > 0) {
        description += `\n    Shock Events: ${shockEvents.length} detected`
        const maxShock = Math.max(...shockEvents.map((r) => r.shock.value))
        description += `\n    Maximum Impact: ${maxShock.toFixed(1)}g`
      }
    }

    // Add alerts
    if (shippingData.iot_data.alerts && shippingData.iot_data.alerts.length > 0) {
      description += `\n    Alerts: ${shippingData.iot_data.alerts.length} detected`
      shippingData.iot_data.alerts.forEach((alert) => {
        description += `\n    - ${alert.type} (${alert.severity}): ${alert.message}`
      })
    }
  }

  return description
}

// Main function to seed the database
async function seedEmbeddings(count = 50) {
  console.log(`Starting to seed ${count} shipment embeddings...`)

  const userId = process.env.SEED_USER_ID || "00000000-0000-0000-0000-000000000000" // Default user ID if not provided

  for (let i = 0; i < count; i++) {
    const shippingData = generateShippingData()
    const shippingText = createShippingDescription(shippingData)
    const embedding = generateRandomEmbedding(1536)

    const embeddingRecord = {
      id: uuidv4(),
      name: `Shipment ${shippingData.tracking_number}`,
      description: `Shipment from ${shippingData.origin_address.country} to ${shippingData.destination_address.country}`,
      source_type: "shipping",
      source_id: shippingData.tracking_number,
      embedding_model: "text-embedding-ada-002",
      vector_data: embedding,
      metadata: {
        content: shippingText,
        shipping_data: shippingData,
      },
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("data_embeddings").insert(embeddingRecord)

    if (error) {
      console.error(`Error inserting record ${i + 1}:`, error)
    } else {
      console.log(`Inserted record ${i + 1}: Shipment ${shippingData.tracking_number}`)
    }
  }

  console.log("Seeding completed!")
}

// Execute the seeding function
seedEmbeddings(50)
