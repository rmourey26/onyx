"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { AlertTriangle } from "lucide-react"

interface ShippingAnalyticsProps {
  analyticsData: any[]
  utilizationData: any[]
}

export function ShippingAnalyticsComponent({ analyticsData = [], utilizationData = [] }: ShippingAnalyticsProps) {
  // Check if we have data
  const hasAnalyticsData = analyticsData && analyticsData.length > 0
  const hasUtilizationData = utilizationData && utilizationData.length > 0

  // If no data is available, show a placeholder
  if (!hasAnalyticsData && !hasUtilizationData) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            No Analytics Data Available
          </CardTitle>
          <CardDescription>
            There is no shipping or package utilization data available for analysis. Try seeding some demo data or
            adding shipments.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Prepare data for charts
  const shipmentStatusData = hasAnalyticsData
    ? analyticsData.slice(0, 7).map((day) => ({
        name: new Date(day.shipping_day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        delivered: day.delivered_count || 0,
        inTransit: day.in_transit_count || 0,
        delayed: day.delayed_count || 0,
      }))
    : []

  const packageUtilizationData = hasUtilizationData
    ? utilizationData.slice(0, 10).map((pkg) => ({
        name: pkg.name?.substring(0, 15) || `Package ${pkg.id?.substring(0, 5)}`,
        reuses: pkg.reuse_count || 0,
        efficiency: pkg.reuses_per_day || 0,
      }))
    : []

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Shipment Status Chart */}
      {hasAnalyticsData && (
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Shipment Status by Day</CardTitle>
            <CardDescription>Tracking of shipment statuses over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shipmentStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="delivered" stackId="a" fill="#10b981" name="Delivered" />
                  <Bar dataKey="inTransit" stackId="a" fill="#3b82f6" name="In Transit" />
                  <Bar dataKey="delayed" stackId="a" fill="#ef4444" name="Delayed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Package Utilization Chart */}
      {hasUtilizationData && (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Package Utilization</CardTitle>
            <CardDescription>Top packages by reuse count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packageUtilizationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="reuses"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {packageUtilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Package Efficiency Chart */}
      {hasUtilizationData && (
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Package Efficiency</CardTitle>
            <CardDescription>Reuses per day for top packages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={packageUtilizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="efficiency" fill="#8884d8" name="Reuses per Day" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Performance Chart */}
      {hasAnalyticsData && (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
            <CardDescription>On-time delivery rate over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={shipmentStatusData.map((day) => ({
                    name: day.name,
                    rate:
                      day.delivered + day.inTransit + day.delayed > 0
                        ? (day.delivered / (day.delivered + day.inTransit + day.delayed)) * 100
                        : 0,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, "On-time Rate"]} />
                  <Line type="monotone" dataKey="rate" stroke="#10b981" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
