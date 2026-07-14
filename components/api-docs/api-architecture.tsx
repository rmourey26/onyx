import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ApiArchitecture() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Architecture</h2>
        <p className="text-muted-foreground mt-2">
          The Resendit-It API is built on a modern, scalable architecture designed for performance and reliability.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>RESTful API Design</CardTitle>
            <CardDescription>Consistent, predictable resource-oriented URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Our API follows REST principles with resource-oriented URLs, HTTP methods as verbs, and HTTP response
              codes to indicate status. This makes the API intuitive and easy to use across different programming
              languages and frameworks.
            </p>
            <div className="mt-4 border rounded-lg p-3 bg-muted/50">
              <h4 className="font-medium text-sm">Key Design Principles:</h4>
              <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                <li>Resource-oriented URLs (e.g., /shipping, /business-cards)</li>
                <li>HTTP methods for actions (GET, POST, PUT, DELETE)</li>
                <li>Standard HTTP status codes (200, 201, 400, 401, etc.)</li>
                <li>Consistent response format with success/error indicators</li>
                <li>Pagination for list endpoints</li>
                <li>Filtering, sorting, and search capabilities</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Microservices Architecture</CardTitle>
            <CardDescription>Modular, scalable backend services</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Behind our unified API facade, Resendit-It uses a microservices architecture that allows us to scale
              individual components independently. Each core function (shipping, packaging, business cards, AI) is
              implemented as a separate service, enabling rapid development and deployment.
            </p>
            <div className="mt-4 border rounded-lg p-3 bg-muted/50">
              <h4 className="font-medium text-sm">Architecture Components:</h4>
              <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                <li>API Gateway for request routing and authentication</li>
                <li>Specialized microservices for each domain</li>
                <li>Event-driven communication between services</li>
                <li>Distributed database architecture</li>
                <li>Containerized deployment with Kubernetes</li>
                <li>Automated CI/CD pipelines</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Architecture</CardTitle>
            <CardDescription>Enterprise-grade security at every layer</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Security is built into every layer of our API architecture. From TLS encryption to JWT authentication and
              role-based access control, we ensure your data remains secure and private.
            </p>
            <div className="mt-4 border rounded-lg p-3 bg-muted/50">
              <h4 className="font-medium text-sm">Security Features:</h4>
              <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                <li>TLS 1.3 encryption for all API traffic</li>
                <li>JWT-based authentication with short-lived tokens</li>
                <li>Role-based access control (RBAC)</li>
                <li>API key scoping and permissions</li>
                <li>Rate limiting and abuse prevention</li>
                <li>Regular security audits and penetration testing</li>
                <li>GDPR and CCPA compliance</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Architecture</CardTitle>
            <CardDescription>Optimized for performance and reliability</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Our data architecture combines relational and NoSQL databases to provide the optimal storage solution for
              each type of data. This hybrid approach ensures high performance, scalability, and data integrity.
            </p>
            <div className="mt-4 border rounded-lg p-3 bg-muted/50">
              <h4 className="font-medium text-sm">Data Components:</h4>
              <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                <li>PostgreSQL for transactional data</li>
                <li>Vector database for embeddings and AI features</li>
                <li>Redis for caching and real-time data</li>
                <li>Event streaming for data synchronization</li>
                <li>Data warehousing for analytics</li>
                <li>Automated backups and disaster recovery</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 border rounded-lg p-6">
        <h3 className="text-xl font-semibold">System Architecture Diagram</h3>
        <div className="mt-4 bg-white p-4 rounded-lg border flex justify-center">
          <div className="relative h-[400px] w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto border-4 border-muted rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔄</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Architecture diagram loading...</p>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          The diagram above illustrates the high-level architecture of the Resendit-It platform, showing how the API
          gateway routes requests to the appropriate microservices, and how data flows between components.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold">Integration Patterns</h3>
        <p className="mt-2 text-sm">
          Resendit-It supports multiple integration patterns to accommodate different use cases and technical
          requirements.
        </p>

        <div className="grid gap-4 mt-4 md:grid-cols-3">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium">Direct API Integration</h4>
            <p className="mt-2 text-xs text-muted-foreground">
              Integrate directly with our RESTful API using HTTP requests. Ideal for custom applications and services
              that need full control over the integration.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium">Webhook-Driven Integration</h4>
            <p className="mt-2 text-xs text-muted-foreground">
              Subscribe to events via webhooks to receive real-time notifications. Perfect for event-driven
              architectures and reactive systems.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium">SDK-Based Integration</h4>
            <p className="mt-2 text-xs text-muted-foreground">
              Use our official SDKs for popular programming languages to simplify integration. Recommended for rapid
              development and reduced maintenance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
