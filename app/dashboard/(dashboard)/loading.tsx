import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    </div>
  )
}
