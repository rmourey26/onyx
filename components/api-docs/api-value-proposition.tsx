import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ApiValueProposition() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Value Proposition</h2>
        <p className="text-muted-foreground mt-2">
          The Resendit-It API delivers significant business value through seamless integration, automation, and enhanced
          capabilities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Seamless Integration</CardTitle>
            <CardDescription>Connect your existing systems effortlessly</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Integrate with your ERP, CRM, and e-commerce platforms</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Standardized RESTful API with comprehensive documentation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">SDKs for popular programming languages</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Webhook support for event-driven architectures</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational Efficiency</CardTitle>
            <CardDescription>Streamline your business processes</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Automate shipping and packaging workflows</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Reduce manual data entry and human error</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Real-time tracking and monitoring capabilities</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Centralized management of reusable packaging</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competitive Advantage</CardTitle>
            <CardDescription>Stand out in the market</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Offer sustainable packaging options to customers</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Showcase your environmental commitment</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Enhance customer experience with digital business cards</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Leverage AI for business optimization</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold">Key Business Benefits</h3>

        <div className="grid gap-6 mt-4 md:grid-cols-2">
          <div className="border rounded-lg p-6">
            <h4 className="font-medium text-lg">Cost Reduction</h4>
            <div className="mt-4 space-y-4">
              <div>
                <h5 className="font-medium text-sm">Packaging Costs</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reduce packaging costs by up to 30% through reusable packaging programs. Our API enables tracking and
                  management of reusable packaging inventory, reducing waste and costs.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-sm">Operational Efficiency</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Automate manual processes to reduce labor costs by 15-25%. API-driven workflows eliminate redundant
                  data entry and streamline operations.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-sm">Damage Reduction</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Decrease product damage by up to 40% with optimized packaging solutions. Our API provides access to
                  packaging recommendations and analytics to minimize damage.
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h4 className="font-medium text-lg">Revenue Growth</h4>
            <div className="mt-4 space-y-4">
              <div>
                <h5 className="font-medium text-sm">Customer Acquisition</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Attract environmentally conscious customers with sustainable packaging options. Our API enables you to
                  showcase your sustainability metrics to customers.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-sm">Customer Retention</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Increase customer loyalty by 20% through improved shipping experiences and digital business cards. Our
                  API enables personalized customer interactions.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-sm">New Market Opportunities</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter new markets with sustainable packaging credentials. Our API provides the data and tools to meet
                  sustainability requirements in various markets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold">Sustainability Impact</h3>
        <p className="mt-2 text-sm">
          Beyond the direct business benefits, the Resendit-It API enables significant environmental impact through
          sustainable packaging practices.
        </p>

        <div className="grid gap-4 mt-4 md:grid-cols-3">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="text-center">
              <span className="text-3xl">🌱</span>
              <h4 className="font-medium mt-2">Carbon Footprint Reduction</h4>
              <p className="text-sm mt-1 text-green-800">
                Reduce carbon emissions by up to 60% compared to traditional single-use packaging
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="text-center">
              <span className="text-3xl">💧</span>
              <h4 className="font-medium mt-2">Water Conservation</h4>
              <p className="text-sm mt-1 text-green-800">
                Save up to 500 liters of water per reusable package compared to manufacturing new packaging
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="text-center">
              <span className="text-3xl">♻️</span>
              <h4 className="font-medium mt-2">Waste Reduction</h4>
              <p className="text-sm mt-1 text-green-800">
                Eliminate up to 90% of packaging waste through reusable packaging programs
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border rounded-lg p-6">
        <h3 className="text-xl font-semibold">Customer Success Stories</h3>

        <div className="grid gap-6 mt-4 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🏪</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Global Retail Chain</h4>
                <p className="text-xs text-muted-foreground">E-commerce & Retail</p>
              </div>
            </div>
            <p className="mt-4 text-sm">
              "By integrating the Resendit-It API with our e-commerce platform, we reduced packaging costs by 32% and
              improved our sustainability metrics significantly. Our customers love the eco-friendly packaging options."
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Results:</span>
                <ul className="mt-1 text-xs space-y-1">
                  <li>32% reduction in packaging costs</li>
                  <li>45% decrease in carbon footprint</li>
                  <li>18% increase in customer satisfaction</li>
                </ul>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">ROI:</span>
                <p className="text-xl font-bold text-green-600">287%</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🏭</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Manufacturing Leader</h4>
                <p className="text-xs text-muted-foreground">Industrial Manufacturing</p>
              </div>
            </div>
            <p className="mt-4 text-sm">
              "The Resendit-It API allowed us to implement a closed-loop packaging system for our B2B customers. We've
              seen dramatic reductions in packaging waste and significant cost savings."
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Results:</span>
                <ul className="mt-1 text-xs space-y-1">
                  <li>78% reduction in packaging waste</li>
                  <li>$1.2M annual cost savings</li>
                  <li>40% faster order processing</li>
                </ul>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">ROI:</span>
                <p className="text-xl font-bold text-green-600">412%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
