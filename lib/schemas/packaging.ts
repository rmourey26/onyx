import { z } from "zod"

// Define the schema for packaging dimensions
const dimensionsSchema = z.object({
  width: z.coerce.number().min(0, { message: "Width must be positive" }),
  height: z.coerce.number().min(0, { message: "Height must be positive" }),
  depth: z.coerce.number().min(0, { message: "Depth must be positive" }),
  unit: z.string().default("inches"),
})

// Define the schema for design data
const designDataSchema = z.object({
  brandColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  logo: z.string().optional(),
  logoPosition: z.string().optional(),
  textColor: z.string().optional(),
  font: z.string().optional(),
  additionalText: z.string().optional(),
  useCompanyLogo: z.boolean().default(true),
})

// Define the schema for design files
const designFileSchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileType: z.string(),
  uploadedAt: z.string().optional(),
})

// Define the schema for IoT sensor configuration
const iotSensorConfigSchema = z.object({
  temperatureSensing: z.boolean().default(false),
  humiditySensing: z.boolean().default(false),
  locationTracking: z.boolean().default(false),
  shockDetection: z.boolean().default(false),
  tamperDetection: z.boolean().default(false),
  batteryLife: z.enum(["standard", "extended"]).default("standard"),
  reportingFrequency: z.enum(["realtime", "hourly", "daily"]).default("hourly"),
})

// Define the schema for packaging orders
export const packagingOrderSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  profile_id: z.string().uuid().optional(),
  order_type: z.enum(["standard", "custom", "bulk"]),
  package_category: z.enum(["mailer", "box", "tube", "pallet_wrap", "protective", "specialty"]).default("mailer"),
  material_type: z.enum([
    "pp_woven",
    "pp_nonwoven",
    "laminated_rubber",
    "recycled_cotton",
    "hemp_composite",
    "mycelium_foam",
    "seaweed_film",
    "biodegradable_plastic",
    "corrugated_cardboard",
    "other",
  ]),
  dimensions: dimensionsSchema.optional(),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
  has_iot_sensors: z.boolean().default(false),
  iot_sensor_count: z.coerce.number().int().min(0).default(0),
  iot_sensor_config: iotSensorConfigSchema.optional(),
  special_instructions: z.string().optional(),
  design_data: designDataSchema.optional(),
  design_files: z.array(designFileSchema).optional(),
  carbon_offset: z.boolean().default(false),
  return_program_enrollment: z.boolean().default(false),
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
  total_price: z.coerce.number().min(0).optional(),
  estimated_co2_savings: z.coerce.number().min(0).optional(),
  lifecycle_count: z.coerce.number().int().min(0).default(0),
  expected_first_delivery_date: z.string().optional(),
})

export type PackagingOrder = z.infer<typeof packagingOrderSchema>

// Define the schema for packaging order items
export const packagingOrderItemSchema = z.object({
  id: z.string().uuid().optional(),
  order_id: z.string().uuid(),
  package_type: z.string(),
  package_category: z.enum(["mailer", "box", "tube", "pallet_wrap", "protective", "specialty"]).default("mailer"),
  material_type: z.enum([
    "pp_woven",
    "pp_nonwoven",
    "laminated_rubber",
    "recycled_cotton",
    "hemp_composite",
    "mycelium_foam",
    "seaweed_film",
    "biodegradable_plastic",
    "corrugated_cardboard",
    "other",
  ]),
  dimensions: dimensionsSchema.optional(),
  quantity: z.coerce.number().int().min(1),
  unit_price: z.coerce.number().min(0).optional(),
  has_iot_sensors: z.boolean().default(false),
  iot_sensor_count: z.coerce.number().int().min(0).default(0),
  iot_sensor_config: iotSensorConfigSchema.optional(),
})

export type PackagingOrderItem = z.infer<typeof packagingOrderItemSchema>

// Define the schema for standard packaging dimensions
export const standardPackagingDimensions = {
  mailer: {
    small: {
      width: 10.25,
      height: 5,
      depth: 0.25,
      unit: "inches",
      description: 'Small Mailer: 5" tall x 10.25" wide x 0.25" in depth, ideal for documents and small items.',
    },
    medium: {
      width: 12.5,
      height: 9.5,
      depth: 0.5,
      unit: "inches",
      description: 'Medium Mailer: 9.5" tall x 12.5" wide x 0.5" in depth, perfect for clothing and soft goods.',
    },
    large: {
      width: 15,
      height: 12,
      depth: 1,
      unit: "inches",
      description: 'Large Mailer: 12" tall x 15" wide x 1" in depth, suitable for bulkier soft items.',
    },
  },
  box: {
    small: {
      width: 8,
      height: 6,
      depth: 4,
      unit: "inches",
      description: 'Small Box: 6" x 8" x 4", ideal for small products and accessories.',
    },
    medium: {
      width: 12,
      height: 10,
      depth: 6,
      unit: "inches",
      description: 'Medium Box: 10" x 12" x 6", perfect for medium-sized products.',
    },
    large: {
      width: 16,
      height: 14,
      depth: 10,
      unit: "inches",
      description: 'Large Box: 14" x 16" x 10", suitable for larger items and multiple products.',
    },
  },
  tube: {
    standard: {
      width: 2.5, // diameter
      height: 24, // length
      depth: 2.5, // diameter (repeated for consistency)
      unit: "inches",
      description: 'Standard Tube: 2.5" diameter x 24" length, ideal for posters and documents.',
    },
    large: {
      width: 4, // diameter
      height: 36, // length
      depth: 4, // diameter (repeated for consistency)
      unit: "inches",
      description: 'Large Tube: 4" diameter x 36" length, perfect for larger posters and blueprints.',
    },
  },
}

// Define material information
export const packagingMaterials = [
  {
    id: "pp_woven",
    name: "PP Woven Fabric",
    description: "Tear-resistant and lightweight • 200+ handling cycles • 30% less mass than cardboard",
    priceMultiplier: 1.0,
    co2Reduction: 0.8, // kg CO2 saved per package compared to single-use
    imageUrl: "/images/materials/pp-woven.jpg",
    categories: ["mailer", "protective"],
    features: ["water_resistant", "durable", "lightweight"],
    recyclable: true,
    biodegradable: false,
    reusable: true,
    maxLifecycleCount: 200,
  },
  {
    id: "pp_nonwoven",
    name: "PP NonWoven Fabric",
    description: "Reduces damage claims by 43% • Fully recyclable composite • 18-month minimum lifecycle",
    priceMultiplier: 1.2,
    co2Reduction: 0.9,
    imageUrl: "/images/materials/pp-nonwoven.jpg",
    categories: ["mailer", "protective"],
    features: ["water_resistant", "durable", "breathable"],
    recyclable: true,
    biodegradable: false,
    reusable: true,
    maxLifecycleCount: 150,
  },
  {
    id: "laminated_rubber",
    name: "Laminated Rubber Substrate",
    description:
      "Reduces damage claims by 43% • Fully recyclable composite • 18-month minimum lifecycle • Waterproof in extreme conditions • Superior durability in transit",
    priceMultiplier: 1.5,
    co2Reduction: 1.2,
    imageUrl: "/images/materials/laminated-rubber.jpg",
    categories: ["mailer", "box", "protective"],
    features: ["waterproof", "extreme_durability", "temperature_resistant"],
    recyclable: true,
    biodegradable: false,
    reusable: true,
    maxLifecycleCount: 300,
  },
  {
    id: "recycled_cotton",
    name: "Recycled Cotton Composite",
    description: "Made from 100% post-consumer textile waste • Soft and flexible • Excellent cushioning properties",
    priceMultiplier: 1.3,
    co2Reduction: 1.5,
    imageUrl: "/images/materials/recycled-cotton.jpg",
    categories: ["mailer", "protective"],
    features: ["biodegradable", "soft", "insulating"],
    recyclable: true,
    biodegradable: true,
    reusable: true,
    maxLifecycleCount: 50,
  },
  {
    id: "hemp_composite",
    name: "Hemp Fiber Composite",
    description: "Sustainable hemp fibers • High tensile strength • Naturally antimicrobial",
    priceMultiplier: 1.4,
    co2Reduction: 1.8,
    imageUrl: "/images/materials/hemp-composite.jpg",
    categories: ["mailer", "box"],
    features: ["antimicrobial", "strong", "sustainable"],
    recyclable: true,
    biodegradable: true,
    reusable: true,
    maxLifecycleCount: 100,
  },
  {
    id: "mycelium_foam",
    name: "Mycelium Foam",
    description: "Grown from mushroom roots • Completely compostable • Superior cushioning",
    priceMultiplier: 1.6,
    co2Reduction: 2.0,
    imageUrl: "/images/materials/mycelium-foam.jpg",
    categories: ["protective", "box"],
    features: ["compostable", "cushioning", "moldable"],
    recyclable: false,
    biodegradable: true,
    reusable: false,
    maxLifecycleCount: 1,
  },
  {
    id: "seaweed_film",
    name: "Seaweed-Based Film",
    description: "Dissolves in water • Zero waste • Perfect for small items",
    priceMultiplier: 1.7,
    co2Reduction: 1.9,
    imageUrl: "/images/materials/seaweed-film.jpg",
    categories: ["mailer", "protective"],
    features: ["water_soluble", "edible", "transparent"],
    recyclable: false,
    biodegradable: true,
    reusable: false,
    maxLifecycleCount: 1,
  },
  {
    id: "biodegradable_plastic",
    name: "Biodegradable Plastic",
    description: "Breaks down in 180 days • Plant-based materials • Waterproof and durable",
    priceMultiplier: 1.3,
    co2Reduction: 0.7,
    imageUrl: "/images/materials/biodegradable-plastic.jpg",
    categories: ["mailer", "box", "tube"],
    features: ["waterproof", "flexible", "transparent_options"],
    recyclable: true,
    biodegradable: true,
    reusable: true,
    maxLifecycleCount: 10,
  },
  {
    id: "corrugated_cardboard",
    name: "Recycled Corrugated Cardboard",
    description: "100% post-consumer waste • Sturdy and familiar • Widely recyclable",
    priceMultiplier: 0.8,
    co2Reduction: 0.5,
    imageUrl: "/images/materials/corrugated-cardboard.jpg",
    categories: ["box", "protective"],
    features: ["lightweight", "customizable", "familiar"],
    recyclable: true,
    biodegradable: true,
    reusable: true,
    maxLifecycleCount: 5,
  },
]

// Package categories
export const packageCategories = [
  {
    id: "mailer",
    name: "Mailers & Envelopes",
    description: "Flexible packaging for documents, clothing, and soft goods",
    basePrice: 25.99,
    imageUrl: "/images/categories/mailers.jpg",
  },
  {
    id: "box",
    name: "Boxes & Containers",
    description: "Rigid packaging for products requiring structural protection",
    basePrice: 32.99,
    imageUrl: "/images/categories/boxes.jpg",
  },
  {
    id: "tube",
    name: "Tubes & Rolls",
    description: "Cylindrical packaging for posters, blueprints, and long items",
    basePrice: 28.99,
    imageUrl: "/images/categories/tubes.jpg",
  },
  {
    id: "pallet_wrap",
    name: "Pallet Wraps & Films",
    description: "Secure bundling for palletized shipments and bulk items",
    basePrice: 89.99,
    imageUrl: "/images/categories/pallet-wraps.jpg",
  },
  {
    id: "protective",
    name: "Protective Inserts & Cushioning",
    description: "Shock-absorbing materials for fragile items",
    basePrice: 19.99,
    imageUrl: "/images/categories/protective.jpg",
  },
  {
    id: "specialty",
    name: "Specialty Packaging",
    description: "Custom solutions for unique products and requirements",
    basePrice: 45.99,
    imageUrl: "/images/categories/specialty.jpg",
  },
]

// IoT sensor information
export const iotSensorInfo = {
  name: "IoT Smart Sensors",
  description: "Track location, temperature, humidity, and shock in real-time",
  pricePerSensor: 12.99,
  imageUrl: "/images/materials/iot-sensor.jpg",
  features: [
    {
      id: "temperatureSensing",
      name: "Temperature Monitoring",
      description: "Monitor temperature conditions from -40°C to 85°C with ±0.5°C accuracy",
      priceAdder: 2.99,
    },
    {
      id: "humiditySensing",
      name: "Humidity Monitoring",
      description: "Track relative humidity from 0% to 100% with ±2% accuracy",
      priceAdder: 2.99,
    },
    {
      id: "locationTracking",
      name: "GPS Location Tracking",
      description: "Real-time location monitoring with 2-5m accuracy",
      priceAdder: 4.99,
    },
    {
      id: "shockDetection",
      name: "Shock & Impact Detection",
      description: "Detect and record impacts from 0.1G to 16G",
      priceAdder: 3.99,
    },
    {
      id: "tamperDetection",
      name: "Tamper Detection",
      description: "Alert when package integrity is compromised",
      priceAdder: 3.99,
    },
  ],
  batteryOptions: [
    {
      id: "standard",
      name: "Standard Battery",
      description: "Up to 30 days of continuous monitoring",
      priceAdder: 0,
    },
    {
      id: "extended",
      name: "Extended Battery",
      description: "Up to 90 days of continuous monitoring",
      priceAdder: 5.99,
    },
  ],
  reportingFrequencies: [
    {
      id: "realtime",
      name: "Real-time Reporting",
      description: "Continuous data transmission (higher battery consumption)",
      priceAdder: 4.99,
    },
    {
      id: "hourly",
      name: "Hourly Updates",
      description: "Data transmitted every hour (balanced approach)",
      priceAdder: 0,
    },
    {
      id: "daily",
      name: "Daily Updates",
      description: "Data transmitted once per day (maximum battery life)",
      priceAdder: -1.99,
    },
  ],
}

// Sustainability program information
export const sustainabilityPrograms = {
  carbonOffset: {
    name: "Carbon Offset Program",
    description: "Neutralize the carbon footprint of your shipments through verified offset projects",
    priceMultiplier: 0.05, // 5% of order total
    imageUrl: "/images/programs/carbon-offset.jpg",
  },
  returnProgram: {
    name: "Packaging Return Program",
    description: "Prepaid return labels for sending packaging back for reuse",
    pricePerUnit: 1.99,
    discountPercentage: 0.15, // 15% discount on next order
    imageUrl: "/images/programs/return-program.jpg",
  },
  bulkDiscount: {
    name: "Bulk Order Sustainability Discount",
    description: "Reduced environmental impact through consolidated production and shipping",
    thresholds: [
      { quantity: 100, discount: 0.05 }, // 5% discount
      { quantity: 500, discount: 0.1 }, // 10% discount
      { quantity: 1000, discount: 0.15 }, // 15% discount
      { quantity: 5000, discount: 0.2 }, // 20% discount
    ],
    imageUrl: "/images/programs/bulk-discount.jpg",
  },
}

// Resend-it specific package information
export const resendItPackage = {
  id: "resend_it_premium",
  name: "Resend*it Premium Mailer",
  description: "Our flagship reusable shipping mailer with integrated tracking label pocket and reinforced seams",
  material: "pp_woven",
  priceMultiplier: 1.2,
  co2Reduction: 1.5,
  imageUrl:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1000016407%20%281%29-rTaUgtHDsO3D8x9cS6S1vx0jyHEDYq.png",
  features: [
    "Tear-resistant PP woven fabric",
    "Integrated shipping label pocket",
    "Reinforced double-stitched seams",
    "Water-resistant construction",
    "Up to 200 reuse cycles",
    "QR code for easy returns",
    "Tamper-evident security seal",
  ],
  sizes: [
    {
      id: "small",
      name: "Small",
      dimensions: { width: 10, height: 7, depth: 0.25, unit: "inches" },
      price: 29.99,
    },
    {
      id: "medium",
      name: "Medium",
      dimensions: { width: 14, height: 10, depth: 0.25, unit: "inches" },
      price: 34.99,
    },
    {
      id: "large",
      name: "Large",
      dimensions: { width: 16, height: 12, depth: 0.5, unit: "inches" },
      price: 39.99,
    },
  ],
  compatibleWithIoT: true,
  recommendedSensorConfig: {
    temperatureSensing: true,
    humiditySensing: true,
    locationTracking: true,
    shockDetection: false,
    tamperDetection: true,
    batteryLife: "standard",
    reportingFrequency: "hourly",
  },
}
