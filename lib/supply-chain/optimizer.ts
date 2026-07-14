// Define the item interface
export interface Item {
  id: string
  length: number
  width: number
  height: number
  weight: number
  quantity: number
  value?: number
  fragile?: boolean
  stackable?: boolean
  metadata?: Record<string, any>
}

// Define the package interface
export interface Package {
  id: string
  length: number
  width: number
  height: number
  weight_capacity: number
  cost?: number
  reusable?: boolean
  metadata?: Record<string, any>
}

// Define the packing solution interface
export interface PackingSolution {
  packages: Array<{
    package_id: string
    items: Array<{
      item_id: string
      position: {
        x: number
        y: number
        z: number
      }
      rotation: "xyz" | "xzy" | "yxz" | "yzx" | "zxy" | "zyx"
    }>
    volume_utilization: number
    weight_utilization: number
    remaining_capacity: number
  }>
  unassigned_items: string[]
  total_packages: number
  total_volume_utilization: number
  total_weight_utilization: number
  total_cost: number
}

// Define the shipping route interface
export interface ShippingRoute {
  origin: {
    latitude: number
    longitude: number
    address: string
  }
  destination: {
    latitude: number
    longitude: number
    address: string
  }
  distance: number
  estimated_time: number
  cost: number
  carrier: string
  service_level: string
  carbon_footprint: number
}

// Define the shipping optimization result interface
export interface ShippingOptimizationResult {
  packing_solution: PackingSolution
  route: ShippingRoute
  total_cost: number
  delivery_date: Date
  carbon_footprint: number
  recommendations: string[]
}

// Supply chain optimizer class
export class SupplyChainOptimizer {
  // 3D bin packing algorithm (First Fit Decreasing)
  optimizePackaging(items: Item[], availablePackages: Package[]): PackingSolution {
    // Sort items by volume in descending order
    const sortedItems = [...items].sort((a, b) => {
      const volumeA = a.length * a.width * a.height
      const volumeB = b.length * b.width * b.height
      return volumeB - volumeA
    })

    // Sort packages by volume in ascending order
    const sortedPackages = [...availablePackages].sort((a, b) => {
      const volumeA = a.length * a.width * a.height
      const volumeB = b.length * b.width * b.height
      return volumeA - volumeB
    })

    // Initialize the solution
    const solution: PackingSolution = {
      packages: [],
      unassigned_items: [],
      total_packages: 0,
      total_volume_utilization: 0,
      total_weight_utilization: 0,
      total_cost: 0,
    }

    // Try to pack each item
    for (const item of sortedItems) {
      // Try each item quantity
      for (let q = 0; q < item.quantity; q++) {
        let packed = false

        // Try to pack the item in an existing package
        for (const packageSolution of solution.packages) {
          const packageData = sortedPackages.find((p) => p.id === packageSolution.package_id)

          if (!packageData) continue

          // Check if the item fits in the package
          if (this.canFitItem(item, packageData, packageSolution)) {
            // Find a position for the item
            const position = this.findPosition(item, packageData, packageSolution)

            if (position) {
              // Add the item to the package
              packageSolution.items.push({
                item_id: item.id,
                position: position.position,
                rotation: position.rotation,
              })

              // Update package utilization
              this.updatePackageUtilization(packageSolution, packageData, item)

              packed = true
              break
            }
          }
        }

        // If the item couldn't be packed in an existing package, try a new package
        if (!packed) {
          // Find the smallest package that can fit the item
          for (const packageData of sortedPackages) {
            if (
              item.length <= packageData.length &&
              item.width <= packageData.width &&
              item.height <= packageData.height &&
              item.weight <= packageData.weight_capacity
            ) {
              // Create a new package solution
              const newPackageSolution = {
                package_id: packageData.id,
                items: [
                  {
                    item_id: item.id,
                    position: { x: 0, y: 0, z: 0 },
                    rotation: "xyz" as const,
                  },
                ],
                volume_utilization: 0,
                weight_utilization: 0,
                remaining_capacity: packageData.weight_capacity - item.weight,
              }

              // Update package utilization
              this.updatePackageUtilization(newPackageSolution, packageData, item)

              // Add the package to the solution
              solution.packages.push(newPackageSolution)

              // Update solution metrics
              solution.total_packages++
              solution.total_cost += packageData.cost || 0

              packed = true
              break
            }
          }
        }

        // If the item couldn't be packed, add it to unassigned items
        if (!packed) {
          solution.unassigned_items.push(item.id)
        }
      }
    }

    // Calculate total utilization
    let totalVolume = 0
    let totalUsedVolume = 0
    let totalWeight = 0
    let totalUsedWeight = 0

    for (const packageSolution of solution.packages) {
      const packageData = sortedPackages.find((p) => p.id === packageSolution.package_id)

      if (packageData) {
        const packageVolume = packageData.length * packageData.width * packageData.height
        totalVolume += packageVolume
        totalUsedVolume += packageVolume * packageSolution.volume_utilization

        totalWeight += packageData.weight_capacity
        totalUsedWeight += packageData.weight_capacity - packageSolution.remaining_capacity
      }
    }

    solution.total_volume_utilization = totalVolume > 0 ? totalUsedVolume / totalVolume : 0
    solution.total_weight_utilization = totalWeight > 0 ? totalUsedWeight / totalWeight : 0

    return solution
  }

  // Check if an item can fit in a package
  private canFitItem(item: Item, packageData: Package, packageSolution: PackingSolution["packages"][0]): boolean {
    // Check weight capacity
    if (item.weight > packageSolution.remaining_capacity) {
      return false
    }

    // Check dimensions (simplified check)
    if (item.length > packageData.length || item.width > packageData.width || item.height > packageData.height) {
      return false
    }

    return true
  }

  // Find a position for an item in a package
  private findPosition(
    item: Item,
    packageData: Package,
    packageSolution: PackingSolution["packages"][0],
  ): { position: { x: number; y: number; z: number }; rotation: "xyz" | "xzy" | "yxz" | "yzx" | "zxy" | "zyx" } | null {
    // Simplified position finding (just place items next to each other)
    // In a real implementation, this would use a more sophisticated algorithm

    // Try different rotations
    const rotations: Array<"xyz" | "xzy" | "yxz" | "yzx" | "zxy" | "zyx"> = ["xyz", "xzy", "yxz", "yzx", "zxy", "zyx"]

    for (const rotation of rotations) {
      // Get item dimensions based on rotation
      const [itemLength, itemWidth, itemHeight] = this.getRotatedDimensions(item, rotation)

      // Check if the rotated item fits in the package
      if (itemLength <= packageData.length && itemWidth <= packageData.width && itemHeight <= packageData.height) {
        // Find a position for the item (simplified)
        // In a real implementation, this would check for collisions with other items
        const position = { x: 0, y: 0, z: 0 }

        return { position, rotation }
      }
    }

    return null
  }

  // Get item dimensions based on rotation
  private getRotatedDimensions(
    item: Item,
    rotation: "xyz" | "xzy" | "yxz" | "yzx" | "zxy" | "zyx",
  ): [number, number, number] {
    switch (rotation) {
      case "xyz":
        return [item.length, item.width, item.height]
      case "xzy":
        return [item.length, item.height, item.width]
      case "yxz":
        return [item.width, item.length, item.height]
      case "yzx":
        return [item.width, item.height, item.length]
      case "zxy":
        return [item.height, item.length, item.width]
      case "zyx":
        return [item.height, item.width, item.length]
    }
  }

  // Update package utilization
  private updatePackageUtilization(
    packageSolution: PackingSolution["packages"][0],
    packageData: Package,
    item: Item,
  ): void {
    // Calculate package volume
    const packageVolume = packageData.length * packageData.width * packageData.height

    // Calculate item volume
    const itemVolume = item.length * item.width * item.height

    // Update volume utilization
    const totalItemsVolume = packageSolution.volume_utilization * packageVolume + itemVolume
    packageSolution.volume_utilization = totalItemsVolume / packageVolume

    // Update weight utilization
    packageSolution.remaining_capacity -= item.weight
  }

  // Optimize shipping routes
  optimizeShippingRoutes(
    origin: { latitude: number; longitude: number; address: string },
    destination: { latitude: number; longitude: number; address: string },
    packages: Package[],
    carriers: Array<{ name: string; service_levels: string[]; rates: Record<string, number> }>,
  ): ShippingRoute[] {
    // Calculate total weight and volume
    let totalWeight = 0
    let totalVolume = 0

    for (const pkg of packages) {
      totalWeight += pkg.weight_capacity
      totalVolume += pkg.length * pkg.width * pkg.height
    }

    // Calculate distance (simplified using Haversine formula)
    const distance = this.calculateDistance(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude,
    )

    // Generate routes for each carrier and service level
    const routes: ShippingRoute[] = []

    for (const carrier of carriers) {
      for (const serviceLevel of carrier.service_levels) {
        // Calculate cost based on weight, volume, distance, and service level
        const rate = carrier.rates[serviceLevel] || 1.0
        const cost = (totalWeight * 0.5 + totalVolume * 0.001 + distance * 0.1) * rate

        // Calculate estimated time based on distance and service level
        let estimatedTime = distance / 800 // Average speed of 800 km per day

        if (serviceLevel === "express") {
          estimatedTime *= 0.7
        } else if (serviceLevel === "economy") {
          estimatedTime *= 1.5
        }

        // Calculate carbon footprint (simplified)
        const carbonFootprint = distance * totalWeight * 0.1

        routes.push({
          origin,
          destination,
          distance,
          estimated_time: estimatedTime,
          cost,
          carrier: carrier.name,
          service_level: serviceLevel,
          carbon_footprint: carbonFootprint,
        })
      }
    }

    // Sort routes by cost
    return routes.sort((a, b) => a.cost - b.cost)
  }

  // Calculate distance using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  // Optimize the entire supply chain
  optimizeSupplyChain(
    items: Item[],
    availablePackages: Package[],
    origin: { latitude: number; longitude: number; address: string },
    destination: { latitude: number; longitude: number; address: string },
    carriers: Array<{ name: string; service_levels: string[]; rates: Record<string, number> }>,
  ): ShippingOptimizationResult {
    // Optimize packaging
    const packingSolution = this.optimizePackaging(items, availablePackages)

    // Get the packages used in the solution
    const usedPackages = packingSolution.packages.map((pkg) => {
      const packageData = availablePackages.find((p) => p.id === pkg.package_id)
      return packageData!
    })

    // Optimize shipping routes
    const routes = this.optimizeShippingRoutes(origin, destination, usedPackages, carriers)

    // Select the best route
    const bestRoute = routes[0]

    // Calculate delivery date
    const now = new Date()
    const deliveryDate = new Date(now.getTime() + bestRoute.estimated_time * 24 * 60 * 60 * 1000)

    // Generate recommendations
    const recommendations: string[] = []

    // Check if there are unassigned items
    if (packingSolution.unassigned_items.length > 0) {
      recommendations.push(
        `${packingSolution.unassigned_items.length} items could not be packed. Consider using larger packages or splitting the shipment.`,
      )
    }

    // Check volume utilization
    if (packingSolution.total_volume_utilization < 0.7) {
      recommendations.push(
        `Low volume utilization (${(packingSolution.total_volume_utilization * 100).toFixed(1)}%). Consider using smaller packages or consolidating shipments.`,
      )
    }

    // Check weight utilization
    if (packingSolution.total_weight_utilization < 0.5) {
      recommendations.push(
        `Low weight utilization (${(packingSolution.total_weight_utilization * 100).toFixed(1)}%). Consider using packages with lower weight capacity.`,
      )
    }

    // Check if there are cheaper routes
    if (routes.length > 1 && routes[1].cost < bestRoute.cost * 0.9) {
      recommendations.push(
        `Consider using ${routes[1].carrier} ${routes[1].service_level} service to save ${(bestRoute.cost - routes[1].cost).toFixed(2)} in shipping costs.`,
      )
    }

    // Check carbon footprint
    const lowCarbonRoute = routes.find((r) => r.carbon_footprint < bestRoute.carbon_footprint * 0.8)
    if (lowCarbonRoute) {
      recommendations.push(
        `Consider using ${lowCarbonRoute.carrier} ${lowCarbonRoute.service_level} service to reduce carbon footprint by ${(((bestRoute.carbon_footprint - lowCarbonRoute.carbon_footprint) / bestRoute.carbon_footprint) * 100).toFixed(1)}%.`,
      )
    }

    return {
      packing_solution: packingSolution,
      route: bestRoute,
      total_cost: packingSolution.total_cost + bestRoute.cost,
      delivery_date: deliveryDate,
      carbon_footprint: bestRoute.carbon_footprint,
      recommendations,
    }
  }
}
