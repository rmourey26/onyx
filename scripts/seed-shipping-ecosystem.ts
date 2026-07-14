import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "@/lib/supabase/database.types"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Types
type ReusablePackageInsert = Database["public"]["Tables"]["reusable_packages"]["Insert"]
type ShippingInsert = Database["public"]["Tables"]["shipping"]["Insert"]
type IoTSensorInsert = {
  id: string
  sensor_id: string
  device_type: string
  status: string
  battery_level: number
  last_reading: string
  location_data: any
  sensor_readings: any
  metadata: any
  created_at: string
  updated_at: string
}

// Utility functions
function generateQRCode(): string {
  const prefix = "RSP"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

function generateTrackingNumber(carrier: string): string {
  const carrierCodes = {
    FedEx: "FX",
    UPS: "UP",
    USPS: "US",
    DHL: "DH",
    Amazon: "AM",
  }
  const code = carrierCodes[carrier as keyof typeof carrierCodes] || "GN"
  return `${code}${Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, "0")}`
}

function randomDate(daysBack = 365): string {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
  return date.toISOString()
}

function generateCoordinates(country: string): { lat: number; lng: number } {
  const countryBounds = {
    US: { lat: [25, 48], lng: [-125, -70] },
    CA: { lat: [43, 60], lng: [-130, -60] },
    UK: { lat: [50, 58], lng: [-8, 2] },
    DE: { lat: [47, 55], lng: [6, 15] },
    FR: { lat: [42, 51], lng: [-5, 8] },
    JP: { lat: [30, 45], lng: [130, 145] },
    AU: { lat: [-43, -10], lng: [113, 153] },
  }

  const bounds = countryBounds[country as keyof typeof countryBounds] || countryBounds.US
  return {
    lat: bounds.lat[0] + Math.random() * (bounds.lat[1] - bounds.lat[0]),
    lng: bounds.lng[0] + Math.random() * (bounds.lng[1] - bounds.lng[0]),
  }
}

// Generate IoT sensor data
function generateIoTSensor(packageId: string): IoTSensorInsert {
  const sensorTypes = ["basic", "advanced", "premium"]
  const deviceTypes = ["temperature_humidity", "gps_tracker", "shock_detector", "multi_sensor"]
  const statuses = ["active", "inactive", "maintenance", "low_battery"]

  const sensorId = `IOT-${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")}`
  const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]
  const status = Math.random() > 0.8 ? statuses[Math.floor(Math.random() * statuses.length)] : "active"
  const batteryLevel = Math.floor(Math.random() * 100)

  // Generate realistic sensor readings
  const readings = []
  const numReadings = Math.floor(Math.random() * 50) + 10

  for (let i = 0; i < numReadings; i++) {
    const timestamp = new Date(Date.now() - (numReadings - i) * 3600000).toISOString()
    readings.push({
      timestamp,
      temperature: {
        value: -5 + Math.random() * 40, // -5°C to 35°C
        unit: "celsius",
      },
      humidity: {
        value: 30 + Math.random() * 40, // 30% to 70%
        unit: "percent",
      },
      pressure: {
        value: 1000 + Math.random() * 50, // 1000-1050 hPa
        unit: "hPa",
      },
      shock: {
        value: Math.random() * 5, // 0-5g normal operation
        unit: "g",
      },
      light: {
        value: Math.random() * 1000,
        unit: "lux",
      },
      battery: {
        value: batteryLevel - i * 0.1, // Gradual battery drain
        unit: "percent",
      },
    })
  }

  // Generate location tracking
  const countries = ["US", "CA", "UK", "DE", "FR"]
  const startCountry = countries[Math.floor(Math.random() * countries.length)]
  const endCountry = countries[Math.floor(Math.random() * countries.length)]

  const locationData = []
  const numLocations = Math.floor(Math.random() * 10) + 5

  for (let i = 0; i < numLocations; i++) {
    const progress = i / (numLocations - 1)
    const startCoords = generateCoordinates(startCountry)
    const endCoords = generateCoordinates(endCountry)

    const lat = startCoords.lat + (endCoords.lat - startCoords.lat) * progress
    const lng = startCoords.lng + (endCoords.lng - startCoords.lng) * progress

    locationData.push({
      timestamp: new Date(Date.now() - (numLocations - i) * 86400000).toISOString(),
      latitude: lat,
      longitude: lng,
      accuracy: Math.floor(Math.random() * 50) + 5,
      facility_type: i === 0 ? "origin" : i === numLocations - 1 ? "destination" : "transit",
    })
  }

  return {
    id: uuidv4(),
    sensor_id: sensorId,
    device_type: deviceType,
    status,
    battery_level: batteryLevel,
    last_reading: new Date().toISOString(),
    location_data: locationData,
    sensor_readings: readings,
    metadata: {
      manufacturer: ["SensorTech", "IoTCorp", "SmartTrack", "PackageSense"][Math.floor(Math.random() * 4)],
      model: `ST-${Math.floor(Math.random() * 1000)}`,
      firmware_version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      installation_date: randomDate(180),
      calibration_date: randomDate(30),
      package_id: packageId,
    },
    created_at: randomDate(180),
    updated_at: new Date().toISOString(),
  }
}

// Generate reusable package
function generateReusablePackage(index: number): { package: ReusablePackageInsert; iotSensor: IoTSensorInsert } {
  const packageTypes = [
    { name: "Standard Box", material: "Recycled Cardboard", category: "box" },
    { name: "Insulated Container", material: "Bio-foam", category: "container" },
    { name: "Plastic Tote", material: "HDPE Plastic", category: "tote" },
    { name: "Fabric Bag", material: "Organic Cotton", category: "bag" },
    { name: "Wooden Crate", material: "Sustainable Pine", category: "crate" },
    { name: "Metal Container", material: "Aluminum", category: "container" },
    { name: "Composite Box", material: "Bamboo Fiber", category: "box" },
    { name: "Vacuum Pack", material: "Biodegradable Film", category: "envelope" },
  ]

  const packageType = packageTypes[Math.floor(Math.random() * packageTypes.length)]
  const statuses = ["available", "in_use", "maintenance", "damaged"]
  const status = Math.random() > 0.7 ? statuses[Math.floor(Math.random() * statuses.length)] : "available"

  const packageId = uuidv4()
  const qrCode = generateQRCode()

  const dimensions = {
    length: Math.round(Math.random() * 80 + 20), // 20-100 cm
    width: Math.round(Math.random() * 60 + 15), // 15-75 cm
    height: Math.round(Math.random() * 50 + 10), // 10-60 cm
    unit: "cm",
  }

  const weightCapacity = Math.round((Math.random() * 45 + 5) * 10) / 10 // 5-50 kg
  const reuseCount = Math.floor(Math.random() * 150) // 0-149 reuses
  const maxReuses = Math.floor(Math.random() * 100 + 200) // 200-299 max reuses

  const packageData: ReusablePackageInsert = {
    id: packageId,
    package_id: `PKG-${index.toString().padStart(4, "0")}`,
    name: `${packageType.name} #${index + 1}`,
    description: `${packageType.material} ${packageType.category} for sustainable shipping`,
    qr_code: qrCode,
    dimensions,
    weight_capacity: weightCapacity,
    material: packageType.material,
    category: packageType.category,
    reuse_count: reuseCount,
    max_reuses: maxReuses,
    status,
    location_id: null,
    current_shipment_id: null,
    shipment_history: [],
    sustainability_score: Math.floor(Math.random() * 30 + 70), // 70-100 score
    metadata: {
      manufacturer: ["EcoPackage", "GreenShip", "SustainBox", "ReusePack"][Math.floor(Math.random() * 4)],
      purchase_date: randomDate(730),
      warranty_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      certifications: ["FSC", "GREENGUARD", "CRADLE_TO_CRADLE"][Math.floor(Math.random() * 3)],
      carbon_footprint: Math.round(Math.random() * 5 + 1), // 1-6 kg CO2
      qr_generation_date: new Date().toISOString(),
    },
    created_at: randomDate(365),
    updated_at: new Date().toISOString(),
    iot_sensor_id: null, // Will be updated after IoT sensor creation
  }

  const iotSensor = generateIoTSensor(packageId)
  packageData.iot_sensor_id = iotSensor.sensor_id

  return { package: packageData, iotSensor }
}

// Generate shipping record
function generateShipping(availablePackages: ReusablePackageInsert[]): ShippingInsert {
  const carriers = ["FedEx", "UPS", "USPS", "DHL", "Amazon"]
  const statuses = ["delivered", "in_transit", "processing", "delayed", "returned"]
  const serviceLevels = ["Standard", "Express", "Priority", "Economy", "Overnight"]
  const countries = ["US", "CA", "UK", "DE", "FR", "JP", "AU"]

  const carrier = carriers[Math.floor(Math.random() * carriers.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const serviceLevel = serviceLevels[Math.floor(Math.random() * serviceLevels.length)]
  const originCountry = countries[Math.floor(Math.random() * countries.length)]
  const destinationCountry = countries[Math.floor(Math.random() * countries.length)]

  const trackingNumber = generateTrackingNumber(carrier)
  const weight = Math.round((Math.random() * 45 + 0.5) * 100) / 100

  const shippingDate = randomDate(90)
  const estimatedDelivery = new Date(
    new Date(shippingDate).getTime() + (Math.random() * 10 + 1) * 24 * 60 * 60 * 1000,
  ).toISOString()
  const actualDelivery =
    status === "delivered"
      ? new Date(new Date(estimatedDelivery).getTime() + (Math.random() * 4 - 2) * 24 * 60 * 60 * 1000).toISOString()
      : null

  // Assign 1-3 packages to this shipment
  const numPackages = Math.floor(Math.random() * 3) + 1
  const selectedPackages = availablePackages
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(numPackages, availablePackages.length))

  const packageIds = selectedPackages.map((pkg) => pkg.id!)

  // Generate IoT sensor ID for this shipment
  const iotSensorId = Math.random() > 0.3 ? `IOT-${Math.floor(Math.random() * 1000000)}` : null

  return {
    id: uuidv4(),
    tracking_number: trackingNumber,
    status,
    carrier,
    weight,
    origin_address: {
      name: `Sender ${Math.floor(Math.random() * 1000)}`,
      street: `${Math.floor(Math.random() * 9999) + 1} Origin St`,
      city: `${originCountry} City`,
      state: `${originCountry} State`,
      zip: `${Math.floor(Math.random() * 99999) + 10000}`,
      country: originCountry,
    },
    destination_address: {
      name: `Recipient ${Math.floor(Math.random() * 1000)}`,
      street: `${Math.floor(Math.random() * 9999) + 1} Destination Ave`,
      city: `${destinationCountry} City`,
      state: `${destinationCountry} State`,
      zip: `${Math.floor(Math.random() * 99999) + 10000}`,
      country: destinationCountry,
    },
    package_ids: packageIds,
    shipping_date: shippingDate,
    estimated_delivery: estimatedDelivery,
    service_level: serviceLevel,
    iot_sensor_id: iotSensorId,
    public_id: uuidv4().substring(0, 8),
    created_at: randomDate(90),
    updated_at: new Date().toISOString(),
  }
}

// Main seeding function
export async function seedShippingEcosystem(packageCount = 50, shippingCount = 100) {
  console.log("🚀 Starting shipping ecosystem seeding...")

  try {
    // Step 1: Create IoT sensor table if it doesn't exist
    console.log("📊 Ensuring IoT sensor table exists...")
    const { error: tableError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.iot_sensors (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          sensor_id text UNIQUE NOT NULL,
          device_type text NOT NULL,
          status text NOT NULL DEFAULT 'active',
          battery_level integer DEFAULT 100,
          last_reading timestamptz DEFAULT now(),
          location_data jsonb DEFAULT '[]'::jsonb,
          sensor_readings jsonb DEFAULT '[]'::jsonb,
          metadata jsonb DEFAULT '{}'::jsonb,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
        
        CREATE INDEX IF NOT EXISTS idx_iot_sensors_sensor_id ON public.iot_sensors(sensor_id);
        CREATE INDEX IF NOT EXISTS idx_iot_sensors_status ON public.iot_sensors(status);
      `,
    })

    if (tableError) {
      console.error("Error creating IoT sensor table:", tableError)
    }

    // Step 2: Generate reusable packages with IoT sensors
    console.log(`📦 Generating ${packageCount} reusable packages with IoT sensors...`)
    const packageData = []
    const iotSensorData = []

    for (let i = 0; i < packageCount; i++) {
      const { package: pkg, iotSensor } = generateReusablePackage(i)
      packageData.push(pkg)
      iotSensorData.push(iotSensor)
    }

    // Step 3: Insert IoT sensors first
    console.log("🔌 Inserting IoT sensors...")
    const { error: iotError } = await supabase.from("iot_sensors" as any).insert(iotSensorData)

    if (iotError) {
      console.error("Error inserting IoT sensors:", iotError)
      throw iotError
    }

    // Step 4: Insert reusable packages
    console.log("📦 Inserting reusable packages...")
    const { data: insertedPackages, error: packageError } = await supabase
      .from("reusable_packages")
      .insert(packageData)
      .select()

    if (packageError) {
      console.error("Error inserting packages:", packageError)
      throw packageError
    }

    // Step 5: Generate and insert shipping records
    console.log(`🚚 Generating ${shippingCount} shipping records...`)
    const shippingData = []

    for (let i = 0; i < shippingCount; i++) {
      const shipping = generateShipping(packageData)
      shippingData.push(shipping)
    }

    // Insert shipping records in batches
    const batchSize = 10
    let insertedShipments = 0

    for (let i = 0; i < shippingData.length; i += batchSize) {
      const batch = shippingData.slice(i, i + batchSize)
      const { error: shippingError } = await supabase.from("shipping").insert(batch)

      if (shippingError) {
        console.error(`Error inserting shipping batch ${i / batchSize + 1}:`, shippingError)
        throw shippingError
      }

      insertedShipments += batch.length
      console.log(`✅ Inserted ${insertedShipments}/${shippingData.length} shipments`)
    }

    // Step 6: Update package shipment history
    console.log("🔄 Updating package shipment histories...")
    for (const shipping of shippingData) {
      if (shipping.package_ids && shipping.package_ids.length > 0) {
        for (const packageId of shipping.package_ids) {
          const { error: updateError } = await supabase
            .from("reusable_packages")
            .update({
              current_shipment_id: shipping.status === "in_transit" ? shipping.id : null,
              shipment_history: supabase.rpc("array_append", {
                arr: "shipment_history",
                elem: shipping.id,
              }) as any,
              reuse_count: supabase.rpc("increment_reuse_count") as any,
            })
            .eq("id", packageId)

          if (updateError) {
            console.warn(`Warning: Could not update package ${packageId}:`, updateError)
          }
        }
      }
    }

    console.log("✨ Shipping ecosystem seeding completed successfully!")
    console.log(`📊 Summary:`)
    console.log(`   • ${packageCount} reusable packages created`)
    console.log(`   • ${packageCount} IoT sensors deployed`)
    console.log(`   • ${shippingCount} shipping records generated`)
    console.log(`   • QR codes generated for all packages`)
    console.log(`   • Package-shipment relationships established`)

    return {
      success: true,
      packages: packageCount,
      iotSensors: packageCount,
      shipments: shippingCount,
    }
  } catch (error) {
    console.error("❌ Error seeding shipping ecosystem:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Execute if run directly
if (require.main === module) {
  seedShippingEcosystem(50, 100)
    .then((result) => {
      console.log("Seeding result:", result)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error("Fatal error:", error)
      process.exit(1)
    })
}
