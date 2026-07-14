export interface ShipmentSearchResult {
  id: string
  tracking_number: string
  status: string
  origin_address: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  destination_address: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  shipping_date: string | null
  estimated_delivery: string | null
  actual_delivery: string | null
  carrier: string
  service_level: string
  shipping_cost: number | null
  notes: string | null
  created_at: string
  updated_at: string
  similarity: number
}

export interface ClusterResult {
  cluster_id: number
  shipments: ShipmentSearchResult[]
  centroid: number[]
  size: number
  avg_distance: number
  key_features: string[]
}

export interface AnomalyResult {
  shipment: ShipmentSearchResult
  anomaly_score: number
  anomaly_type: string
  explanation: string
  threshold: number
  is_anomaly: boolean
}
