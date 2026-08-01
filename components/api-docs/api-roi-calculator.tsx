"use client"

import { useState } from "react"
import { Calculator, ChevronDown, ChevronUp, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ApiRoiCalculator() {
  const [showCalculator, setShowCalculator] = useState(false)
  const [shipments, setShipments] = useState(1000)
  const [packagingCost, setPackagingCost] = useState(5)
  const [reuseRate, setReuseRate] = useState(60)
  const [implementationCost, setImplementationCost] = useState(5000)

  // Calculate ROI
  const annualShippingCost = shipments * packagingCost
  const reusableSavings = annualShippingCost * (reuseRate / 100)
  const firstYearSavings = reusableSavings - implementationCost
  const firstYearROI = (firstYearSavings / implementationCost) * 100
  const fiveYearSavings = reusableSavings * 5 - implementationCost
  const fiveYearROI = (fiveYearSavings / implementationCost) * 100

  // Calculate sustainability impact
  const carbonSavingsPerPackage = 2.5 // kg CO2
  const waterSavingsPerPackage = 500 // liters
  const plasticReductionPerPackage = 0.5 // kg

  const packagesReused = shipments * (reuseRate / 100)
  const carbonSavings = packagesReused * carbonSavingsPerPackage
  const waterSavings = packagesReused * waterSavingsPerPackage
  const plasticReduction = packagesReused * plasticReductionPerPackage

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ROI Analysis</h2>
        <p className="text-muted-foreground mt-2">
          Understand the financial and environmental return on investment from implementing the Kronova platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financial ROI</CardTitle>
            <CardDescription>Quantifiable financial benefits of the Kronova platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Cost Savings</h4>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">Packaging Cost Reduction:</span>
                      <span className="text-sm ml-1">
                        30-50% reduction in packaging expenses through reusable packaging
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">Operational Efficiency:</span>
                      <span className="text-sm ml-1">15-25% reduction in labor costs through automation</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">Damage Reduction:</span>
                      <span className="text-sm ml-1">30-40% decrease in product damage and returns</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">Revenue Growth</h4>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">Customer Acquisition:</span>
                      <span className="text-sm ml-1">10-15% increase in environmentally conscious customers</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">Customer Retention:</span>
                      <span className="text-sm ml-1">20% improvement in customer loyalty</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">Typical ROI Timeline</h4>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Timeframe</th>
                        <th className="px-4 py-2 text-right">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-2">6 months</td>
                        <td className="px-4 py-2 text-right">50-100%</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">1 year</td>
                        <td className="px-4 py-2 text-right">150-250%</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">3 years</td>
                        <td className="px-4 py-2 text-right">400-600%</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">5 years</td>
                        <td className="px-4 py-2 text-right">800-1200%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environmental ROI</CardTitle>
            <CardDescription>Quantifiable environmental benefits of the Kronova platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Carbon Footprint Reduction</h4>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">Per Package:</span>
                      <span className="text-sm ml-1">2.5 kg CO2 saved per reused package</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">Annual Impact:</span>
                      <span className="text-sm ml-1">Up to 60% reduction in packaging-related emissions</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">Resource Conservation</h4>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">Water Savings:</span>
                      <span className="text-sm ml-1">500 liters of water saved per reused package</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">Plastic Reduction:</span>
                      <span className="text-sm ml-1">0.5 kg of plastic waste avoided per reused package</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">Tree Equivalent:</span>
                      <span className="text-sm ml-1">1 tree saved for every 10 packages reused</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">Sustainability Reporting</h4>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">ESG Metrics:</span>
                      <span className="text-sm ml-1">Quantifiable data for sustainability reporting</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-medium mr-2">•</span>
                    <div>
                      <span className="font-medium">Certification Support:</span>
                      <span className="text-sm ml-1">Data for sustainability certifications and compliance</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button
          variant="outline"
          onClick={() => setShowCalculator(!showCalculator)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center">
            <Calculator className="mr-2 h-4 w-4" />
            <span>ROI Calculator</span>
          </div>
          {showCalculator ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showCalculator && (
          <div className="mt-4 border rounded-lg p-6">
            <h3 className="text-xl font-semibold">ROI Calculator</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Estimate your potential ROI from implementing the Kronova platform
            </p>

            <div className="grid gap-6 mt-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shipments">Annual Shipments</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">The number of packages you ship annually</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="shipments"
                      min={100}
                      max={10000}
                      step={100}
                      value={[shipments]}
                      onValueChange={(value) => setShipments(value[0])}
                    />
                    <Input
                      type="number"
                      value={shipments}
                      onChange={(e) => setShipments(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="packagingCost">Average Packaging Cost ($)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Average cost per package</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="packagingCost"
                      min={1}
                      max={20}
                      step={0.5}
                      value={[packagingCost]}
                      onValueChange={(value) => setPackagingCost(value[0])}
                    />
                    <Input
                      type="number"
                      value={packagingCost}
                      onChange={(e) => setPackagingCost(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reuseRate">Reuse Rate (%)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Percentage of packages that will be reused</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="reuseRate"
                      min={10}
                      max={90}
                      step={5}
                      value={[reuseRate]}
                      onValueChange={(value) => setReuseRate(value[0])}
                    />
                    <Input
                      type="number"
                      value={reuseRate}
                      onChange={(e) => setReuseRate(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="implementationCost">Implementation Cost ($)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">One-time cost to implement the platform</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="implementationCost"
                      min={1000}
                      max={20000}
                      step={1000}
                      value={[implementationCost]}
                      onValueChange={(value) => setImplementationCost(value[0])}
                    />
                    <Input
                      type="number"
                      value={implementationCost}
                      onChange={(e) => setImplementationCost(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Tabs defaultValue="financial">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="financial">Financial ROI</TabsTrigger>
                    <TabsTrigger value="environmental">Environmental Impact</TabsTrigger>
                  </TabsList>
                  <TabsContent value="financial" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">First Year ROI</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-3xl font-bold text-green-600">{firstYearROI.toFixed(0)}%</div>
                          <p className="text-sm text-muted-foreground mt-1">${firstYearSavings.toFixed(0)} savings</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">5-Year ROI</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-3xl font-bold text-green-600">{fiveYearROI.toFixed(0)}%</div>
                          <p className="text-sm text-muted-foreground mt-1">${fiveYearSavings.toFixed(0)} savings</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium">Financial Breakdown</h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Annual Shipping Cost:</span>
                          <span>${annualShippingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Savings from Reuse:</span>
                          <span>${reusableSavings.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Implementation Cost:</span>
                          <span>${implementationCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>First Year Net Savings:</span>
                          <span>${firstYearSavings.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="environmental" className="space-y-4 mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">Carbon Saved</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-2xl font-bold text-green-600">{carbonSavings.toFixed(0)} kg</div>
                          <p className="text-xs text-muted-foreground mt-1">CO₂ equivalent</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">Water Saved</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-2xl font-bold text-blue-600">{(waterSavings / 1000).toFixed(0)} m³</div>
                          <p className="text-xs text-muted-foreground mt-1">{waterSavings.toFixed(0)} liters</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">Plastic Reduced</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-2xl font-bold text-purple-600">{plasticReduction.toFixed(0)} kg</div>
                          <p className="text-xs text-muted-foreground mt-1">Plastic waste avoided</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium">Environmental Equivalents</h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Trees Equivalent:</span>
                          <span>{(carbonSavings / 25).toFixed(1)} trees</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Car Miles Avoided:</span>
                          <span>{(carbonSavings * 2.5).toFixed(0)} miles</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Plastic Bottles Saved:</span>
                          <span>{(plasticReduction * 20).toFixed(0)} bottles</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 border rounded-lg p-6">
        <h3 className="text-xl font-semibold">Implementation Timeline</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Typical timeline for implementing the Kronova platform and realizing ROI
        </p>

        <div className="mt-6 relative">
          <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-muted"></div>

          <div className="relative pl-10 pb-10">
            <div className="absolute left-0 rounded-full bg-primary w-8 h-8 flex items-center justify-center text-white">
              1
            </div>
            <h4 className="font-medium">API Integration (2-4 weeks)</h4>
            <p className="text-sm mt-1">
              Connect your systems to the Kronova API. Our documentation and SDKs make this process straightforward.
            </p>
          </div>

          <div className="relative pl-10 pb-10">
            <div className="absolute left-0 rounded-full bg-primary w-8 h-8 flex items-center justify-center text-white">
              2
            </div>
            <h4 className="font-medium">Pilot Program (1-2 months)</h4>
            <p className="text-sm mt-1">
              Start with a small-scale implementation to test the system and measure initial results.
            </p>
          </div>

          <div className="relative pl-10 pb-10">
            <div className="absolute left-0 rounded-full bg-primary w-8 h-8 flex items-center justify-center text-white">
              3
            </div>
            <h4 className="font-medium">Full Deployment (2-3 months)</h4>
            <p className="text-sm mt-1">
              Roll out the platform across your entire operation, with ongoing support from our team.
            </p>
          </div>

          <div className="relative pl-10">
            <div className="absolute left-0 rounded-full bg-green-500 w-8 h-8 flex items-center justify-center text-white">
              ✓
            </div>
            <h4 className="font-medium">ROI Realization (6-12 months)</h4>
            <p className="text-sm mt-1">
              Begin seeing significant ROI within 6 months, with full ROI typically achieved within the first year.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
