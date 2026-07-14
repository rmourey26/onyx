// Clustering system for vector embeddings
export class ClusteringSystem {
  // K-means clustering
  async clusterVectors(
    vectors: { id: string; vector: number[] }[],
    options: {
      algorithm: string
      clusterCount: number
      maxIterations?: number
      distanceThreshold?: number
    },
  ): Promise<
    {
      id: number
      centroid: number[]
      points: { id: string; vector: number[]; distance: number }[]
      avgDistance: number
    }[]
  > {
    const { algorithm, clusterCount, maxIterations = 100, distanceThreshold = 0.001 } = options

    if (vectors.length === 0) {
      return []
    }

    if (algorithm === "kmeans") {
      return this.kMeansClustering(vectors, clusterCount, maxIterations, distanceThreshold)
    } else if (algorithm === "hierarchical") {
      return this.hierarchicalClustering(vectors, clusterCount)
    } else if (algorithm === "dbscan") {
      return this.dbscanClustering(vectors, 0.2, 3)
    } else {
      throw new Error(`Unsupported clustering algorithm: ${algorithm}`)
    }
  }

  // K-means clustering implementation
  private async kMeansClustering(
    vectors: { id: string; vector: number[] }[],
    k: number,
    maxIterations: number,
    distanceThreshold: number,
  ): Promise<
    {
      id: number
      centroid: number[]
      points: { id: string; vector: number[]; distance: number }[]
      avgDistance: number
    }[]
  > {
    if (vectors.length <= k) {
      // If we have fewer vectors than clusters, each vector gets its own cluster
      return vectors.map((vector, index) => ({
        id: index,
        centroid: vector.vector,
        points: [{ id: vector.id, vector: vector.vector, distance: 0 }],
        avgDistance: 0,
      }))
    }

    // Initialize centroids randomly
    const centroids = this.initializeCentroids(vectors, k)
    let clusters: { centroid: number[]; points: { id: string; vector: number[]; distance: number }[] }[] = []
    let iterations = 0
    let centroidsChanged = true

    while (centroidsChanged && iterations < maxIterations) {
      // Assign points to clusters
      clusters = centroids.map((centroid) => ({
        centroid,
        points: [],
      }))

      for (const vector of vectors) {
        let minDistance = Number.POSITIVE_INFINITY
        let closestClusterIndex = 0

        // Find the closest centroid
        for (let i = 0; i < centroids.length; i++) {
          const distance = this.euclideanDistance(vector.vector, centroids[i])
          if (distance < minDistance) {
            minDistance = distance
            closestClusterIndex = i
          }
        }

        // Assign to the closest cluster
        clusters[closestClusterIndex].points.push({
          id: vector.id,
          vector: vector.vector,
          distance: minDistance,
        })
      }

      // Update centroids
      centroidsChanged = false
      for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i]
        if (cluster.points.length === 0) continue

        const newCentroid = this.calculateCentroid(cluster.points.map((p) => p.vector))
        const distance = this.euclideanDistance(newCentroid, centroids[i])

        if (distance > distanceThreshold) {
          centroids[i] = newCentroid
          centroidsChanged = true
        }
      }

      iterations++
    }

    // Calculate average distance for each cluster
    return clusters.map((cluster, index) => {
      const avgDistance =
        cluster.points.length > 0 ? cluster.points.reduce((sum, p) => sum + p.distance, 0) / cluster.points.length : 0

      return {
        id: index,
        centroid: cluster.centroid,
        points: cluster.points,
        avgDistance,
      }
    })
  }

  // Hierarchical clustering implementation (simplified)
  private async hierarchicalClustering(
    vectors: { id: string; vector: number[] }[],
    k: number,
  ): Promise<
    {
      id: number
      centroid: number[]
      points: { id: string; vector: number[]; distance: number }[]
      avgDistance: number
    }[]
  > {
    // Start with each point in its own cluster
    const clusters = vectors.map((vector, index) => ({
      id: index,
      points: [{ id: vector.id, vector: vector.vector, distance: 0 }],
    }))

    // Merge clusters until we have k clusters
    while (clusters.length > k) {
      let minDistance = Number.POSITIVE_INFINITY
      let closestPair = [-1, -1]

      // Find the closest pair of clusters
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const distance = this.calculateClusterDistance(
            clusters[i].points.map((p) => p.vector),
            clusters[j].points.map((p) => p.vector),
          )

          if (distance < minDistance) {
            minDistance = distance
            closestPair = [i, j]
          }
        }
      }

      // Merge the closest pair
      const [i, j] = closestPair
      const mergedPoints = [...clusters[i].points, ...clusters[j].points]
      clusters[i] = {
        id: clusters[i].id,
        points: mergedPoints,
      }

      // Remove the second cluster
      clusters.splice(j, 1)
    }

    // Calculate centroids and average distances
    return clusters.map((cluster) => {
      const centroid = this.calculateCentroid(cluster.points.map((p) => p.vector))

      // Calculate distances from centroid
      const pointsWithDistances = cluster.points.map((point) => {
        const distance = this.euclideanDistance(point.vector, centroid)
        return { ...point, distance }
      })

      const avgDistance =
        pointsWithDistances.length > 0
          ? pointsWithDistances.reduce((sum, p) => sum + p.distance, 0) / pointsWithDistances.length
          : 0

      return {
        id: cluster.id,
        centroid,
        points: pointsWithDistances,
        avgDistance,
      }
    })
  }

  // DBSCAN clustering implementation
  private async dbscanClustering(
    vectors: { id: string; vector: number[] }[],
    epsilon: number,
    minPoints: number,
  ): Promise<
    {
      id: number
      centroid: number[]
      points: { id: string; vector: number[]; distance: number }[]
      avgDistance: number
    }[]
  > {
    // Initialize all points as unvisited
    const visited: boolean[] = new Array(vectors.length).fill(false)
    const clustered: number[] = new Array(vectors.length).fill(-1) // -1 means noise
    let clusterCount = 0

    // For each point
    for (let i = 0; i < vectors.length; i++) {
      if (visited[i]) continue

      visited[i] = true

      // Find neighbors
      const neighbors = this.getNeighbors(vectors, i, epsilon)

      if (neighbors.length < minPoints) {
        // Mark as noise
        clustered[i] = -1
      } else {
        // Start a new cluster
        const clusterId = clusterCount++
        clustered[i] = clusterId

        // Expand cluster
        const seeds = [...neighbors]
        while (seeds.length > 0) {
          const currentPoint = seeds.shift()!

          if (!visited[currentPoint]) {
            visited[currentPoint] = true

            const currentNeighbors = this.getNeighbors(vectors, currentPoint, epsilon)

            if (currentNeighbors.length >= minPoints) {
              seeds.push(...currentNeighbors.filter((n) => !seeds.includes(n) && !visited[n]))
            }
          }

          if (clustered[currentPoint] === -1) {
            clustered[currentPoint] = clusterId
          }
        }
      }
    }

    // Group points by cluster
    const clusters: { id: number; points: { id: string; vector: number[] }[] }[] = []

    for (let i = 0; i < vectors.length; i++) {
      const clusterId = clustered[i]
      if (clusterId === -1) continue // Skip noise

      if (!clusters[clusterId]) {
        clusters[clusterId] = { id: clusterId, points: [] }
      }

      clusters[clusterId].points.push({
        id: vectors[i].id,
        vector: vectors[i].vector,
      })
    }

    // Calculate centroids and distances
    return Object.values(clusters).map((cluster) => {
      const centroid = this.calculateCentroid(cluster.points.map((p) => p.vector))

      // Calculate distances from centroid
      const pointsWithDistances = cluster.points.map((point) => {
        const distance = this.euclideanDistance(point.vector, centroid)
        return { ...point, distance }
      })

      const avgDistance =
        pointsWithDistances.length > 0
          ? pointsWithDistances.reduce((sum, p) => sum + p.distance, 0) / pointsWithDistances.length
          : 0

      return {
        id: cluster.id,
        centroid,
        points: pointsWithDistances,
        avgDistance,
      }
    })
  }

  // Helper method to get neighbors within epsilon distance
  private getNeighbors(vectors: { id: string; vector: number[] }[], pointIndex: number, epsilon: number): number[] {
    const neighbors: number[] = []

    for (let i = 0; i < vectors.length; i++) {
      if (i !== pointIndex && this.euclideanDistance(vectors[pointIndex].vector, vectors[i].vector) <= epsilon) {
        neighbors.push(i)
      }
    }

    return neighbors
  }

  // Initialize centroids using k-means++ method
  private initializeCentroids(vectors: { id: string; vector: number[] }[], k: number): number[][] {
    const centroids: number[][] = []
    const vectorsData = vectors.map((v) => v.vector)

    // Choose the first centroid randomly
    const firstCentroidIndex = Math.floor(Math.random() * vectorsData.length)
    centroids.push([...vectorsData[firstCentroidIndex]])

    // Choose the remaining centroids
    for (let i = 1; i < k; i++) {
      // Calculate distances from points to the nearest centroid
      const distances = vectorsData.map((vector) => {
        const distances = centroids.map((centroid) => this.euclideanDistance(vector, centroid))
        return Math.min(...distances)
      })

      // Choose the next centroid with probability proportional to distance squared
      const sumDistances = distances.reduce((sum, distance) => sum + distance * distance, 0)
      let random = Math.random() * sumDistances
      let index = 0

      while (random > 0 && index < distances.length) {
        random -= distances[index] * distances[index]
        index++
      }

      centroids.push([...vectorsData[Math.max(0, index - 1)]])
    }

    return centroids
  }

  // Calculate the centroid of a set of vectors
  private calculateCentroid(vectors: number[][]): number[] {
    if (vectors.length === 0) {
      return []
    }

    const dimensions = vectors[0].length
    const centroid = new Array(dimensions).fill(0)

    for (const vector of vectors) {
      for (let i = 0; i < dimensions; i++) {
        centroid[i] += vector[i]
      }
    }

    for (let i = 0; i < dimensions; i++) {
      centroid[i] /= vectors.length
    }

    return centroid
  }

  // Calculate the distance between two clusters (average linkage)
  private calculateClusterDistance(cluster1: number[][], cluster2: number[][]): number {
    let totalDistance = 0
    let count = 0

    for (const vector1 of cluster1) {
      for (const vector2 of cluster2) {
        totalDistance += this.euclideanDistance(vector1, vector2)
        count++
      }
    }

    return count > 0 ? totalDistance / count : Number.POSITIVE_INFINITY
  }

  // Calculate Euclidean distance between two vectors
  private euclideanDistance(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      throw new Error("Vectors must have the same dimensions")
    }

    let sum = 0
    for (let i = 0; i < vector1.length; i++) {
      const diff = vector1[i] - vector2[i]
      sum += diff * diff
    }

    return Math.sqrt(sum)
  }
}
