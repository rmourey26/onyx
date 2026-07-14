"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { GitBranch, Play, CheckCircle, InfoIcon } from "lucide-react"

export function AIWorkflowExample() {
  const [activeTab, setActiveTab] = useState("lead-qualification")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState<any>(null)
  const [leadData, setLeadData] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    company: "Acme Corp",
    position: "CTO",
    inquiry:
      "We're looking to implement a sustainable packaging solution for our e-commerce business. We ship approximately 5,000 packages per month and want to reduce our environmental impact while maintaining cost efficiency.",
  })
  const [customerData, setCustomerData] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    company: "Bright Ideas Inc",
    product_interest: "Digital Business Cards with NFT Integration",
    current_solution: "Traditional paper business cards",
    pain_points: "Difficulty tracking distribution, environmental concerns, and lack of digital integration",
  })
  const [contentData, setContentData] = useState({
    topic: "Sustainable Packaging Benefits",
    target_audience: "E-commerce business owners",
    key_points: "Cost savings, environmental impact, customer perception, regulatory compliance",
    tone: "Professional but approachable",
    length: "800-1000 words",
  })

  const handleExecute = () => {
    setIsExecuting(true)
    setTimeout(() => {
      setIsExecuting(false)

      if (activeTab === "lead-qualification") {
        setExecutionResults({
          status: "completed",
          steps: {
            extract_info: {
              company_size: "Medium",
              industry: "E-commerce",
              budget_range: "$10,000-$50,000",
              timeline: "3-6 months",
              decision_maker: true,
            },
            score_lead: {
              score: 85,
              qualification: "Qualified",
              next_steps: "Schedule demo with sales team",
              recommended_products: ["Sustainable Packaging Suite", "Logistics Optimization Platform"],
            },
            save_to_crm: {
              success: true,
              crm_id: "lead_12345",
              assigned_to: "Alex Thompson",
            },
          },
        })
      } else if (activeTab === "customer-onboarding") {
        setExecutionResults({
          status: "completed",
          steps: {
            analyze_needs: {
              recommended_plan: "Business Pro",
              custom_features: ["NFT Minting Integration", "CRM Sync", "Analytics Dashboard"],
              implementation_timeline: "2 weeks",
            },
            generate_resources: {
              welcome_email:
                "Welcome to Resendit-It! We're excited to help you transform your business card experience...",
              tutorial_links: ["Getting Started Guide", "NFT Integration Tutorial", "Mobile App Setup"],
              faq_items: [
                "How do I mint my first NFT?",
                "Can I track who views my digital card?",
                "How do I update my information?",
              ],
            },
            setup_account: {
              account_id: "cust_67890",
              api_key: "sk_test_••••••••••••••••",
              dashboard_url: "https://app.resendit.it/dashboard/cust_67890",
            },
          },
        })
      } else if (activeTab === "content-generation") {
        setExecutionResults({
          status: "completed",
          steps: {
            research_topic: {
              key_statistics: [
                "Sustainable packaging can reduce carbon footprint by up to 60%",
                "87% of consumers prefer businesses that use sustainable packaging",
                "Regulatory requirements for packaging waste are increasing in 43 countries",
              ],
              competitor_analysis:
                "5 leading e-commerce brands have switched to sustainable packaging in the last year",
              trending_subtopics: ["Biodegradable materials", "Reusable packaging systems", "Right-sizing packages"],
            },
            generate_content: {
              title: "The Triple Bottom Line: How Sustainable Packaging Boosts Profits, Planet, and Perception",
              introduction:
                "In today's environmentally conscious marketplace, sustainable packaging isn't just good for the planet—it's good for business...",
              sections: [
                "The Hidden Costs of Traditional Packaging",
                "ROI of Sustainable Alternatives",
                "Customer Loyalty and Brand Perception",
                "Navigating Regulatory Requirements",
                "Implementation Strategies for E-commerce Businesses",
              ],
              conclusion:
                "By investing in sustainable packaging solutions, e-commerce businesses can reduce costs, meet regulatory requirements, enhance brand perception, and contribute to environmental sustainability...",
            },
            review_quality: {
              score: 92,
              strengths: ["Well-researched", "Actionable insights", "Appropriate tone"],
              suggestions: ["Add more specific case studies", "Include a section on measurement metrics"],
            },
          },
        })
      }
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Workflow Examples</CardTitle>
          <CardDescription>
            Explore and test example workflows to understand how the Workflow System can automate complex processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Mobile-optimized tabs with horizontal scroll */}
            <div className="w-full overflow-x-auto">
              <TabsList className="w-full sm:w-auto grid grid-cols-1 sm:grid-cols-3 h-auto p-1 bg-muted rounded-lg">
                <div className="flex sm:contents overflow-x-auto">
                  <TabsTrigger
                    value="lead-qualification"
                    className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap flex-shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    <span className="hidden sm:inline">Lead Qualification</span>
                    <span className="sm:hidden">Lead Qual.</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="customer-onboarding"
                    className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap flex-shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    <span className="hidden sm:inline">Customer Onboarding</span>
                    <span className="sm:hidden">Onboarding</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="content-generation"
                    className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap flex-shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    <span className="hidden sm:inline">Content Generation</span>
                    <span className="sm:hidden">Content</span>
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>

            <TabsContent value="lead-qualification" className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-medium">Lead Qualification Workflow</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                This workflow analyzes lead information, scores the lead based on qualification criteria, and saves the
                qualified lead to your CRM system.
              </p>

              <div className="border rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-2">Workflow Steps</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Extract Lead Information</div>
                      <p className="text-sm text-muted-foreground">
                        AI agent extracts structured information from the lead inquiry
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium shrink-0">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Score and Qualify Lead</div>
                      <p className="text-sm text-muted-foreground">
                        Evaluates the lead against qualification criteria and assigns a score
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Save to CRM</div>
                      <p className="text-sm text-muted-foreground">
                        Stores qualified leads in your CRM system with appropriate tags and assignments
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-2">Test the Workflow</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Lead Information</label>
                    <Textarea
                      value={`Name: ${leadData.name}
Email: ${leadData.email}
Company: ${leadData.company}
Position: ${leadData.position}
Inquiry: ${leadData.inquiry}`}
                      onChange={(e) => {
                        // This is a simplified example, in a real app you'd parse this text
                        // and update the leadData object accordingly
                      }}
                      className="mt-1 h-32"
                    />
                  </div>
                </div>

                <Button onClick={handleExecute} disabled={isExecuting} className="mt-4 w-full">
                  {isExecuting ? (
                    <>Running Workflow...</>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Workflow
                    </>
                  )}
                </Button>
              </div>

              {executionResults && activeTab === "lead-qualification" && (
                <div className="border rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Execution Results</h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium">Step 1: Extract Lead Information</h5>
                      <div className="bg-muted rounded-md p-3 mt-2 text-sm">
                        <div>
                          <span className="font-medium">Company Size:</span>{" "}
                          {executionResults.steps.extract_info.company_size}
                        </div>
                        <div>
                          <span className="font-medium">Industry:</span> {executionResults.steps.extract_info.industry}
                        </div>
                        <div>
                          <span className="font-medium">Budget Range:</span>{" "}
                          {executionResults.steps.extract_info.budget_range}
                        </div>
                        <div>
                          <span className="font-medium">Timeline:</span> {executionResults.steps.extract_info.timeline}
                        </div>
                        <div>
                          <span className="font-medium">Decision Maker:</span>{" "}
                          {executionResults.steps.extract_info.decision_maker ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium">Step 2: Score and Qualify Lead</h5>
                      <div className="bg-muted rounded-md p-3 mt-2 text-sm">
                        <div>
                          <span className="font-medium">Lead Score:</span> {executionResults.steps.score_lead.score}/100
                        </div>
                        <div>
                          <span className="font-medium">Qualification:</span>{" "}
                          {executionResults.steps.score_lead.qualification}
                        </div>
                        <div>
                          <span className="font-medium">Next Steps:</span>{" "}
                          {executionResults.steps.score_lead.next_steps}
                        </div>
                        <div>
                          <span className="font-medium">Recommended Products:</span>
                        </div>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {executionResults.steps.score_lead.recommended_products.map(
                            (product: string, index: number) => (
                              <li key={index}>{product}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium">Step 3: Save to CRM</h5>
                      <div className="bg-muted rounded-md p-3 mt-2 text-sm">
                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          {executionResults.steps.save_to_crm.success ? "Success" : "Failed"}
                        </div>
                        <div>
                          <span className="font-medium">CRM ID:</span> {executionResults.steps.save_to_crm.crm_id}
                        </div>
                        <div>
                          <span className="font-medium">Assigned To:</span>{" "}
                          {executionResults.steps.save_to_crm.assigned_to}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="customer-onboarding" className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-medium">Customer Onboarding Workflow</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                This workflow analyzes customer needs, generates personalized onboarding resources, and sets up their
                account with the appropriate configurations.
              </p>

              <div className="border rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-2">Workflow Steps</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Analyze Customer Needs</div>
                      <p className="text-sm text-muted-foreground">
                        AI agent analyzes customer information to recommend the best plan and features
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium shrink-0">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Generate Onboarding Resources</div>
                      <p className="text-sm text-muted-foreground">
                        Creates personalized welcome emails, tutorials, and FAQs based on customer needs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Set Up Customer Account</div>
                      <p className="text-sm text-muted-foreground">
                        Provisions the customer account with the recommended plan and features
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-2">Test the Workflow</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Customer Information</label>
                    <Textarea
                      value={`Name: ${customerData.name}
Email: ${customerData.email}
Company: ${customerData.company}
Product Interest: ${customerData.product_interest}
Current Solution: ${customerData.current_solution}
Pain Points: ${customerData.pain_points}`}
                      onChange={(e) => {
                        // This is a simplified example
                      }}
                      className="mt-1 h-32"
                    />
                  </div>
                </div>

                <Button onClick={handleExecute} disabled={isExecuting} className="mt-4 w-full">
                  {isExecuting ? (
                    <>Running Workflow...</>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Workflow
                    </>
                  )}
                </Button>
              </div>

              {executionResults && activeTab === "customer-onboarding" && (
                <div className="border rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Execution Results</h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium">Step 1: Analyze Customer Needs</h5>
                      <div className="bg-muted rounded-md p-3 mt-2 text-sm">
                        <div>
                          <span className="font-medium">Recommended Plan:</span>{" "}
                          {executionResults.steps.analyze_needs.recommended_plan}
                        </div>
                        <div>
                          <span className="font-medium">Custom Features:</span>
                        </div>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {executionResults.steps.analyze_needs.custom_features.map(
                            (feature: string, index: number) => (
                              <li key={index}>{feature}</li>
                            ),
                          )}
                        </ul>
                        <div>
                          <span className="font-medium">Implementation Timeline:</span>{" "}
                          {executionResults.steps.analyze_needs.implementation_timeline}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium">Step 2: Generate Onboarding Resources</h5>
                      <div className="bg-muted rounded-md p-3 mt-2 text-sm">
                        <div>
                          <span className="font-medium">Welcome Email:</span>{" "}
                          <span className="italic">
                            {executionResults.steps.generate_resources.welcome_email.substring(0, 50)}...
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Tutorial Links:</span>
                        </div>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {executionResults.steps.generate_resources.tutorial_links.map(
                            (link: string, index: number) => (
                              <li key={index}>{link}</li>
                            ),
                          )}
                        </ul>
                        <div>
                          <span className="font-medium">FAQ Items:</span>
                        </div>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {executionResults.steps.generate_resources.faq_items.map((faq: string, index: number) => (
                            <li key={index}>{faq}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium">Step 3: Set Up Customer Account</h5>
                      <div className="bg-muted rounded-md p-3 mt-2 text-sm">
                        <div>
                          <span className="font-medium">Account ID:</span>{" "}
                          {executionResults.steps.setup_account.account_id}
                        </div>
                        <div>
                          <span className="font-medium">API Key:</span> {executionResults.steps.setup_account.api_key}
                        </div>
                        <div>
                          <span className="font-medium">Dashboard URL:</span>{" "}
                          {executionResults.steps.setup_account.dashboard_url}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="content-generation" className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-medium">Content Generation Workflow</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                This workflow researches a topic, generates high-quality content, and reviews it for quality before
                publishing.
              </p>

              <div className="border rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-2">Workflow Steps</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Research Topic</div>
                      <p className="text-sm text-muted-foreground">
                        Gathers statistics, competitor analysis, and trending subtopics
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium shrink-0">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Generate Content</div>
                      <p className="text-sm text-muted-foreground">
                        Creates comprehensive, well-structured content based on research
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-800 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Review Quality</div>
                      <p className="text-sm text-muted-foreground">
                        Evaluates content quality and provides improvement suggestions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-2">Test the Workflow</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Content Requirements</label>
                    <Textarea
                      value={`Topic: ${contentData.topic}
Target Audience: ${contentData.target_audience}
Key Points: ${contentData.key_points}
Tone: ${contentData.tone}
Length: ${contentData.length}`}
                      onChange={(e) => {
                        // This is a simplified example
                      }}
                      className="mt-1 h-32"
                    />
                  </div>
                </div>

                <Button onClick={handleExecute} disabled={isExecuting} className="mt-4 w-full">
                  {isExecuting ? (
                    <>Running Workflow...</>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Workflow
                    </>
                  )}
                </Button>
              </div>

              {executionResults && activeTab === "content-generation" && (
                <div className="border rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Execution Results</h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium">Step 1: Research Topic</h5>
                      <div className="bg-muted rounded-md p-3 mt-2 text-sm">
                        <div>
                          <span className="font-medium">Key Statistics:</span>
                        </div>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {executionResults.steps.research_topic.key_statistics.map((stat: string, index: number) => (
                            <li key={index}>{stat}</li>
                          ))}
                        </ul>
                        <div>
                          <span className="font-medium">Competitor Analysis:</span>{" "}
                          {executionResults.steps.research_topic.competitor_analysis}
                        </div>
                        <div>
                          <span className="font-medium">Trending Subtopics:</span>{" "}
                          {executionResults.steps.research_topic.trending_subtopics.join(", ")}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium">Step 2: Generate Content</h5>
                      <div className="bg-muted rounded-md p-3 mt-2 text-sm">
                        <div>
                          <span className="font-medium">Title:</span> {executionResults.steps.generate_content.title}
                        </div>
                        <div>
                          <span className="font-medium">Introduction:</span>{" "}
                          <span className="italic">
                            {executionResults.steps.generate_content.introduction.substring(0, 100)}...
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Sections:</span>
                        </div>
                        <ol className="list-decimal list-inside ml-2 mt-1">
                          {executionResults.steps.generate_content.sections.map((section: string, index: number) => (
                            <li key={index}>{section}</li>
                          ))}
                        </ol>
                        <div>
                          <span className="font-medium">Conclusion:</span>{" "}
                          <span className="italic">
                            {executionResults.steps.generate_content.conclusion.substring(0, 100)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium">Step 3: Review Quality</h5>
                      <div className="bg-muted rounded-md p-3 mt-2 text-sm">
                        <div>
                          <span className="font-medium">Quality Score:</span>{" "}
                          {executionResults.steps.review_quality.score}/100
                        </div>
                        <div>
                          <span className="font-medium">Strengths:</span>{" "}
                          {executionResults.steps.review_quality.strengths.join(", ")}
                        </div>
                        <div>
                          <span className="font-medium">Improvement Suggestions:</span>{" "}
                          {executionResults.steps.review_quality.suggestions.join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Alert className="w-full">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Try It Yourself</AlertTitle>
            <AlertDescription>
              These examples demonstrate how workflows can automate complex processes by connecting multiple AI
              capabilities. You can create similar workflows for your own business processes using the Workflow System.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  )
}
