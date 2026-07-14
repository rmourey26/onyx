"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package,
  Recycle,
  Cpu,
  QrCode,
  BarChart3,
  Shield,
  Truck,
  Boxes,
  Users,
  LineChart,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function FeatureAnimations() {
  const [activeSection, setActiveSection] = useState(0)
  const sections = [
    "Smart Circular Packaging",
    "Advanced Materials",
    "Technical Capabilities",
    "Blockchain Incentives",
    "AI-Powered Insights",
    "Implementation",
  ]

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % sections.length)
    }, 10000)

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [sections.length])

  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    autoPlayRef.current = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % sections.length)
    }, 10000)
  }

  const handleSectionChange = (index: number) => {
    setActiveSection(index)
    resetAutoPlay()
  }

  const handleNext = () => {
    setActiveSection((prev) => (prev + 1) % sections.length)
    resetAutoPlay()
  }

  const handlePrev = () => {
    setActiveSection((prev) => (prev - 1 + sections.length) % sections.length)
    resetAutoPlay()
  }

  return (
    <div className="w-full py-16 bg-black bg-grid-pattern relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 right-1/4 blockchain-node"></div>
        <div className="absolute top-1/3 left-1/3 blockchain-node"></div>
        <div className="absolute bottom-1/4 right-1/3 blockchain-node"></div>
        <div className="absolute bottom-1/3 left-1/4 blockchain-node"></div>
        <div className="absolute top-1/2 left-1/2 blockchain-node"></div>

        <div className="absolute top-1/4 right-1/4 w-32 h-px blockchain-line transform rotate-45"></div>
        <div className="absolute top-1/3 left-1/3 w-40 h-px blockchain-line transform -rotate-45"></div>
        <div className="absolute bottom-1/4 right-1/3 w-36 h-px blockchain-line transform -rotate-30"></div>
        <div className="absolute bottom-1/3 left-1/4 w-48 h-px blockchain-line transform rotate-30"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
            Revolutionizing Logistics
          </span>
          <span className="block text-xl mt-2 text-gray-400">The Smart Circular Economy Packaging System</span>
        </h2>

        {/* Navigation tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => handleSectionChange(index)}
              className={cn(
                "px-4 py-2 rounded-full text-sm transition-all duration-300",
                activeSection === index
                  ? "bg-tech-green text-white shadow-lg shadow-tech-green/30"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700",
              )}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="relative min-h-[500px] bg-gray-900/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-800">
          <AnimatePresence mode="wait">
            {activeSection === 0 && <SmartCircularPackaging key="smart-packaging" />}

            {activeSection === 1 && <AdvancedMaterials key="advanced-materials" />}

            {activeSection === 2 && <TechnicalCapabilities key="technical-capabilities" />}

            {activeSection === 3 && <BlockchainIncentives key="blockchain-incentives" />}

            {activeSection === 4 && <AIPoweredInsights key="ai-insights" />}

            {activeSection === 5 && <ImplementationTimeline key="implementation" />}
          </AnimatePresence>

          {/* Navigation arrows */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-tech-green hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-tech-green hover:text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-6 gap-2">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSectionChange(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                activeSection === index ? "bg-tech-green" : "bg-gray-700 hover:bg-gray-600",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Individual animation components
function SmartCircularPackaging() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white">Smart Circular Packaging System</h3>
        <p className="text-gray-300">
          Welcome to a transformative approach to packaging that addresses today's most pressing logistics challenges.
          Our Smart Circular Packaging System combines durability, reusability, and advanced technology to create a
          solution that benefits your business, customers, and the planet.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-tech-green/20 rounded-lg">
              <Recycle className="h-5 w-5 text-tech-green" />
            </div>
            <div>
              <h4 className="font-medium text-white">Sustainability Focused</h4>
              <p className="text-sm text-gray-400">Packaging reimagined as strategic advantage</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-tech-green/20 rounded-lg">
              <Boxes className="h-5 w-5 text-tech-green" />
            </div>
            <div>
              <h4 className="font-medium text-white">Operational Excellence</h4>
              <p className="text-sm text-gray-400">Efficient systems for multiple use cycles</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-tech-green/20 rounded-lg">
              <Shield className="h-5 w-5 text-tech-green" />
            </div>
            <div>
              <h4 className="font-medium text-white">Environmental Impact</h4>
              <p className="text-sm text-gray-400">Reducing waste while enhancing brand value</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-tech-radial opacity-20 rounded-xl"></div>
        <div className="relative z-10 h-full flex flex-col justify-center">
          <div className="grid grid-cols-1 gap-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
            >
              <h4 className="text-lg font-medium text-white mb-2">Consumer Sentiment</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-tech-green mb-1">70%</div>
                  <p className="text-xs text-gray-400">Willing to pay more for eco-friendly packaging</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-tech-green mb-1">66%</div>
                  <p className="text-xs text-gray-400">Would return packages if process is convenient</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-tech-green mb-1">84%</div>
                  <p className="text-xs text-gray-400">More loyal to brands sharing their values</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-tech-green/20 to-transparent rounded-xl animate-pulse"></div>
              <div className="relative p-4 border border-tech-green/30 rounded-xl backdrop-blur-sm">
                <h4 className="text-lg font-medium text-white mb-2">The Packaging Paradox</h4>
                <p className="text-sm text-gray-300">
                  Traditional packaging methods create a paradox of costs, waste, and inefficiency that holds businesses
                  back in today's competitive market.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/70 p-3 rounded-lg">
                    <h5 className="text-sm font-medium text-tech-green">Sustainability Pressure</h5>
                    <p className="text-xs text-gray-400 mt-1">
                      70% of consumers will pay premium prices for sustainable options
                    </p>
                  </div>
                  <div className="bg-gray-800/70 p-3 rounded-lg">
                    <h5 className="text-sm font-medium text-tech-green">Logistics Opacity & Cost</h5>
                    <p className="text-xs text-gray-400 mt-1">
                      Standard supply chains suffer from lack of real-time tracking
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AdvancedMaterials() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white">Advanced Materials</h3>
        <p className="text-gray-300">
          Our innovative packaging uses cutting-edge materials designed for durability, reusability, and environmental
          responsibility. These materials represent a significant advancement over traditional single-use packaging
          options.
        </p>

        <div className="grid grid-cols-1 gap-4 mt-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-tech-green/50 transition-colors"
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h4 className="font-medium text-white flex items-center gap-2">
              <span className="p-1 bg-tech-green/20 rounded">
                <Package className="h-4 w-4 text-tech-green" />
              </span>
              PP Woven & Non-Woven Fabric
            </h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-tech-green" />
                Tear-resistant and lightweight
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-tech-green" />
                200+ handling cycles
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-tech-green" />
                30% less mass than cardboard
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-tech-green/50 transition-colors"
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h4 className="font-medium text-white flex items-center gap-2">
              <span className="p-1 bg-tech-green/20 rounded">
                <BarChart3 className="h-4 w-4 text-tech-green" />
              </span>
              Performance Benefits
            </h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-tech-green" />
                Reduces damage claims by 43%
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-tech-green" />
                Fully recyclable composite
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-tech-green" />
                18-month minimum lifecycle
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-tech-green/50 transition-colors"
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h4 className="font-medium text-white flex items-center gap-2">
              <span className="p-1 bg-tech-green/20 rounded">
                <Shield className="h-4 w-4 text-tech-green" />
              </span>
              Weather Protection
            </h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-tech-green" />
                Laminated rubber substrate
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-tech-green" />
                Waterproof in extreme conditions
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-tech-green" />
                Superior durability in transit
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-tech-radial opacity-20 rounded-xl"></div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative w-full max-w-md"
        >
          <div className="relative z-10 bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tech-green to-transparent"></div>

            <h4 className="text-xl font-bold text-white mb-6">Quantifiable Impact</h4>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1 text-center">
                <div className="text-3xl font-bold text-tech-green">40%</div>
                <p className="text-sm text-gray-400">Warehouse Space Reduction</p>
              </div>

              <div className="space-y-1 text-center">
                <div className="text-3xl font-bold text-tech-green">27%</div>
                <p className="text-sm text-gray-400">Handling Time Decrease</p>
              </div>

              <div className="space-y-1 text-center">
                <div className="text-3xl font-bold text-tech-green">100x</div>
                <p className="text-sm text-gray-400">Reusability Per Unit</p>
              </div>

              <div className="space-y-1 text-center">
                <div className="text-3xl font-bold text-tech-green">22%</div>
                <p className="text-sm text-gray-400">Carbon Footprint Reduction</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-300">
                Our system delivers demonstrable results across critical business areas, with approximately
                <span className="text-tech-green font-bold"> 30% return on cost savings</span> based on projected
                models.
              </p>
            </div>

            {/* Animated particles */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 opacity-20">
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-tech-green rounded-full animate-ping"></div>
              <div
                className="absolute top-1/3 left-1/4 w-2 h-2 bg-tech-green rounded-full animate-ping"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute top-2/3 left-2/3 w-2 h-2 bg-tech-green rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function TechnicalCapabilities() {
  const [activeCapability, setActiveCapability] = useState(0)
  const capabilities = [
    {
      title: "End-to-end Returns",
      description: "Complete lifecycle tracking with blockchain technology",
      icon: <Recycle className="h-6 w-6" />,
      details:
        "Our blockchain-based tracking system provides complete visibility into the entire lifecycle of each packaging unit, from initial shipment through multiple reuse cycles.",
    },
    {
      title: "Smart QR Returns",
      description: "Instant processing with dynamic scanning",
      icon: <QrCode className="h-6 w-6" />,
      details:
        "Customers can initiate returns with a simple QR code scan, triggering automated processing and reward distribution through our secure blockchain network.",
    },
    {
      title: "Dynamic Routing",
      description: "AI-optimized routes reduce carbon footprint by 35%",
      icon: <Truck className="h-6 w-6" />,
      details:
        "Our AI algorithms continuously optimize routing for both forward and reverse logistics, significantly reducing transit times, costs, and environmental impact.",
    },
    {
      title: "White-Label Platform",
      description: "Customizable interface that integrates with existing systems",
      icon: <Cpu className="h-6 w-6" />,
      details:
        "Our platform seamlessly integrates with your existing systems while providing a fully customizable interface that can be branded to match your company's identity.",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCapability((prev) => (prev + 1) % capabilities.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [capabilities.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-white">Technical Capabilities</h3>
        <p className="text-gray-300 mt-2">
          Our platform combines cutting-edge technologies to create a comprehensive solution for modern logistics
          challenges. Each capability is designed to enhance efficiency, sustainability, and customer satisfaction.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {capabilities.map((capability, index) => (
          <button
            key={index}
            onClick={() => setActiveCapability(index)}
            className={cn(
              "p-4 rounded-lg transition-all duration-300 text-left",
              activeCapability === index ? "bg-tech-green text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700",
            )}
          >
            {/* Replaced React.cloneElement with direct component rendering for React 19 compatibility */}
            <div
              className={cn(
                "p-2 rounded-lg inline-flex mb-3",
                activeCapability === index ? "bg-white/20" : "bg-tech-green/20",
              )}
            >
              <capability.icon className={activeCapability === index ? "text-white" : "text-tech-green"} />
            </div>
            <h4 className="font-medium">{capability.title}</h4>
            <p className={cn("text-sm mt-1", activeCapability === index ? "text-white/80" : "text-gray-400")}>
              {capability.description}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8 relative">
        <div className="absolute inset-0 bg-tech-radial opacity-20 rounded-xl"></div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCapability}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-start gap-6">
              <div className="p-4 bg-tech-green/20 rounded-lg">
                {React.cloneElement(capabilities[activeCapability].icon, { className: "h-8 w-8 text-tech-green" })}
              </div>

              <div className="flex-1">
                <h4 className="text-xl font-bold text-white">{capabilities[activeCapability].title}</h4>
                <p className="text-gray-300 mt-2">{capabilities[activeCapability].details}</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCapability === 0 && (
                    <>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Blockchain Verification</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Every transaction is securely recorded on our distributed ledger, ensuring complete
                          transparency and trust throughout the supply chain.
                        </p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Lifecycle Management</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Track each packaging unit through its entire lifecycle, from production to final recycling,
                          with detailed analytics at every stage.
                        </p>
                      </div>
                    </>
                  )}

                  {activeCapability === 1 && (
                    <>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Instant Processing</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Returns are processed immediately upon QR code scan, eliminating delays and providing
                          customers with instant confirmation.
                        </p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Reward Distribution</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Automated reward distribution ensures customers receive incentives immediately, enhancing
                          satisfaction and encouraging participation.
                        </p>
                      </div>
                    </>
                  )}

                  {activeCapability === 2 && (
                    <>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Carbon Reduction</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          AI-optimized routes reduce carbon emissions by up to 35%, contributing significantly to your
                          sustainability goals.
                        </p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Predictive Analytics</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Our system predicts optimal routing based on historical data, current conditions, and machine
                          learning algorithms.
                        </p>
                      </div>
                    </>
                  )}

                  {activeCapability === 3 && (
                    <>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Seamless Integration</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Our platform integrates with your existing ERP, WMS, and logistics systems, requiring minimal
                          changes to your current infrastructure.
                        </p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Customization Options</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Fully customizable interface and workflows to match your brand identity and specific
                          operational requirements.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function BlockchainIncentives() {
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white">Blockchain-Powered Customer Incentives</h3>
        <p className="text-gray-300">
          Transform your process from a cost center into a powerful engine for customer loyalty. Our system leverages
          familiar QR code scanning - we know 66% of consumers would use reusables if it was easy. The blockchain
          guarantees fair, accurate reward distribution while creating ongoing interaction opportunities.
        </p>

        <div className="space-y-4 mt-6">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h4 className="font-medium text-white">Loyalty Boost</h4>
            <p className="text-sm text-gray-400 mt-1">
              Estimated <span className="text-tech-green font-bold">15% increase</span> in brand loyalty through our
              incentive program, creating ongoing customer engagement opportunities.
            </p>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h4 className="font-medium text-white">Reward Options</h4>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-tech-green"></div>
                Points & Discounts
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-tech-green"></div>
                Gift Cards
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-tech-green"></div>
                Rebates
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-tech-green"></div>
                Digital Tokens
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-tech-radial opacity-20 rounded-xl"></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6 overflow-hidden">
            <h4 className="text-xl font-bold text-white mb-6">Incentive Process Flow</h4>

            <div className="relative">
              {/* Step 1: QR Scan */}
              <motion.div
                className={cn(
                  "transition-all duration-500 absolute inset-0",
                  animationStep === 0 ? "opacity-100 z-10" : "opacity-0 z-0",
                )}
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="h-16 w-16 text-tech-green" />
                  </div>
                  <h5 className="text-lg font-medium text-white">QR Scan</h5>
                  <p className="text-sm text-gray-400 text-center mt-2">
                    Simple return initiation via smart device at shipping carrier
                  </p>
                </div>
              </motion.div>

              {/* Step 2: Blockchain Verification */}
              <motion.div
                className={cn(
                  "transition-all duration-500 absolute inset-0",
                  animationStep === 1 ? "opacity-100 z-10" : "opacity-0 z-0",
                )}
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
                    <div className="relative z-10">
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="12" y="12" width="10" height="10" rx="2" fill="#34A853" />
                        <rect x="27" y="12" width="10" height="10" rx="2" fill="#34A853" />
                        <rect x="42" y="12" width="10" height="10" rx="2" fill="#34A853" />
                        <rect x="12" y="27" width="10" height="10" rx="2" fill="#34A853" />
                        <rect x="27" y="27" width="10" height="10" rx="2" fill="#34A853" />
                        <rect x="42" y="27" width="10" height="10" rx="2" fill="#34A853" />
                        <rect x="12" y="42" width="10" height="10" rx="2" fill="#34A853" />
                        <rect x="27" y="42" width="10" height="10" rx="2" fill="#34A853" />
                        <rect x="42" y="42" width="10" height="10" rx="2" fill="#34A853" />
                      </svg>
                    </div>
                  </div>
                  <h5 className="text-lg font-medium text-white">Blockchain Verification</h5>
                  <p className="text-sm text-gray-400 text-center mt-2">
                    Transaction verified securely on distributed ledger
                  </p>
                </div>
              </motion.div>

              {/* Step 3: Instant Rewards */}
              <motion.div
                className={cn(
                  "transition-all duration-500 absolute inset-0",
                  animationStep === 2 ? "opacity-100 z-10" : "opacity-0 z-0",
                )}
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="20" stroke="#34A853" strokeWidth="2" />
                      <path d="M32 20V32L40 36" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
                      <path d="M24 44L40 44" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h5 className="text-lg font-medium text-white">Instant Rewards</h5>
                  <p className="text-sm text-gray-400 text-center mt-2">
                    Points, discounts, gift cards, rebates, or tokens issued
                  </p>
                </div>
              </motion.div>

              {/* Step 4: Loyalty Boost */}
              <motion.div
                className={cn(
                  "transition-all duration-500 absolute inset-0",
                  animationStep === 3 ? "opacity-100 z-10" : "opacity-0 z-0",
                )}
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-16 w-16 text-tech-green" />
                  </div>
                  <h5 className="text-lg font-medium text-white">Loyalty Boost</h5>
                  <p className="text-sm text-gray-400 text-center mt-2">Estimated 15% increase in brand loyalty</p>
                </div>
              </motion.div>
            </div>

            {/* Progress indicator */}
            <div className="mt-12 flex justify-center gap-2">
              {[0, 1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => setAnimationStep(step)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    animationStep === step ? "bg-tech-green" : "bg-gray-700 hover:bg-gray-600",
                  )}
                  aria-label={`Go to step ${step + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AIPoweredInsights() {
  const [activeInsight, setActiveInsight] = useState(0)
  const insights = [
    {
      title: "Logistics Optimizer",
      description:
        "Monitor transit times, suggest optimal routing for forward and reverse logistics, flag delays, and predict package return volumes by location.",
      icon: <Truck className="h-6 w-6" />,
    },
    {
      title: "Inventory & Lifecycle Monitor",
      description:
        "Track the status and location of your active packaging fleet, predict refurbishment needs based on the 100-use cycle, and identify underutilized assets.",
      icon: <Boxes className="h-6 w-6" />,
    },
    {
      title: "Customer Incentive Analyst",
      description:
        "Analyze return rates versus reward structures, correlate incentive program participation with the 15% loyalty boost, and segment user behavior.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Sustainability Tracker",
      description:
        "Automatically calculate and report key ESG metrics like waste reduction (40%), CO2 savings (22%), and reuse rates per shipment or period.",
      icon: <LineChart className="h-6 w-6" />,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-white">AI-Powered Insights: Your Command Center</h3>
        <p className="text-gray-300 mt-2">
          Our white-label analytics platform provides unparalleled visibility and control, allowing you to configure AI
          agents to monitor your most important KPIs. Each agent delivers specialized insights to optimize different
          aspects of your packaging ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          {insights.map((insight, index) => (
            <button
              key={index}
              onClick={() => setActiveInsight(index)}
              className={cn(
                "w-full p-4 rounded-lg text-left transition-all duration-300 flex items-start gap-3",
                activeInsight === index ? "bg-tech-green text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700",
              )}
            >
              <div className={cn("p-2 rounded-lg mt-1", activeInsight === index ? "bg-white/20" : "bg-tech-green/20")}>
                {React.cloneElement(insight.icon, {
                  className: activeInsight === index ? "h-5 w-5 text-white" : "h-5 w-5 text-tech-green",
                })}
              </div>
              <div>
                <h4 className="font-medium">{insight.title}</h4>
                <p className={cn("text-sm mt-1", activeInsight === index ? "text-white/80" : "text-gray-400")}>
                  {insight.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 relative">
          <div className="absolute inset-0 bg-tech-radial opacity-20 rounded-xl"></div>

          <div className="relative z-10 h-full">
            <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6 h-full">
              <AnimatePresence mode="wait">
                {activeInsight === 0 && <LogisticsOptimizerVisual key="logistics" />}

                {activeInsight === 1 && <InventoryMonitorVisual key="inventory" />}

                {activeInsight === 2 && <CustomerIncentiveVisual key="customer" />}

                {activeInsight === 3 && <SustainabilityTrackerVisual key="sustainability" />}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function LogisticsOptimizerVisual() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <h4 className="text-xl font-bold text-white mb-4">Logistics Optimizer</h4>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h5 className="text-sm font-medium text-tech-green mb-2">Route Optimization</h5>
          <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="30" r="5" fill="#34A853" />
                <circle cx="170" cy="90" r="5" fill="#34A853" />
                <circle cx="70" cy="60" r="3" fill="#555555" />
                <circle cx="120" cy="40" r="3" fill="#555555" />
                <path d="M30 30 L70 60 L120 40 L170 90" stroke="#34A853" strokeWidth="2" strokeDasharray="4 2" />
                <path d="M30 30 L170 90" stroke="#34A853" strokeWidth="2" strokeOpacity="0.3" />
              </svg>
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">35% carbon reduction</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            AI-optimized routes reduce transit times and environmental impact
          </p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h5 className="text-sm font-medium text-tech-green mb-2">Return Volume Prediction</h5>
          <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="90" width="20" height="20" fill="#34A853" />
                <rect x="50" y="70" width="20" height="40" fill="#34A853" />
                <rect x="80" y="50" width="20" height="60" fill="#34A853" />
                <rect x="110" y="60" width="20" height="50" fill="#34A853" />
                <rect x="140" y="30" width="20" height="80" fill="#34A853" />
                <rect x="170" y="40" width="20" height="70" fill="#34A853" />
                <path d="M30 50 L60 40 L90 30 L120 45 L150 20 L180 25" stroke="white" strokeWidth="2" />
                <circle cx="30" cy="50" r="3" fill="white" />
                <circle cx="60" cy="40" r="3" fill="white" />
                <circle cx="90" cy="30" r="3" fill="white" />
                <circle cx="120" cy="45" r="3" fill="white" />
                <circle cx="150" cy="20" r="3" fill="white" />
                <circle cx="180" cy="25" r="3" fill="white" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Predict package return volumes by location and time period</p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h5 className="text-sm font-medium text-tech-green mb-2">Delay Detection</h5>
          <div className="h-24 flex items-center">
            <div className="w-full grid grid-cols-5 gap-2">
              <div className="h-16 bg-gray-700 rounded-md flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="h-16 bg-gray-700 rounded-md flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="h-16 bg-gray-700 rounded-md flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
              </div>
              <div className="h-16 bg-gray-700 rounded-md flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              </div>
              <div className="h-16 bg-gray-700 rounded-md flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Real-time monitoring flags potential delays before they impact delivery
          </p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h5 className="text-sm font-medium text-tech-green mb-2">Performance Metrics</h5>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Transit Time</span>
              <span className="text-white">-27%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-tech-green h-2 rounded-full" style={{ width: "73%" }}></div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Return Processing</span>
              <span className="text-white">-43%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-tech-green h-2 rounded-full" style={{ width: "57%" }}></div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Handling Efficiency</span>
              <span className="text-white">+38%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-tech-green h-2 rounded-full" style={{ width: "38%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function InventoryMonitorVisual() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <h4 className="text-xl font-bold text-white mb-4">Inventory & Lifecycle Monitor</h4>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 md:col-span-2">
          <h5 className="text-sm font-medium text-tech-green mb-2">Packaging Fleet Status</h5>
          <div className="aspect-[3/1] bg-gray-900 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
            <div className="absolute inset-0 p-4">
              <div className="grid grid-cols-4 gap-4 h-full">
                <div className="flex flex-col justify-between">
                  <div className="text-xs text-gray-400">Active</div>
                  <div className="text-xl font-bold text-white">68%</div>
                  <div className="h-24 bg-gray-800 rounded-md relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-tech-green h-[68%] rounded-md"></div>
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div className="text-xs text-gray-400">In Transit</div>
                  <div className="text-xl font-bold text-white">22%</div>
                  <div className="h-24 bg-gray-800 rounded-md relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 h-[22%] rounded-md"></div>
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div className="text-xs text-gray-400">Maintenance</div>
                  <div className="text-xl font-bold text-white">7%</div>
                  <div className="h-24 bg-gray-800 rounded-md relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-yellow-500 h-[7%] rounded-md"></div>
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div className="text-xs text-gray-400">End-of-Life</div>
                  <div className="text-xl font-bold text-white">3%</div>
                  <div className="h-24 bg-gray-800 rounded-md relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-red-500 h-[3%] rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h5 className="text-sm font-medium text-tech-green mb-2">Lifecycle Usage</h5>
          <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 relative">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#444"
                    strokeWidth="1"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#34A853"
                    strokeWidth="3"
                    strokeDasharray="75, 100"
                  />
                  <text x="18" y="20.5" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
                    75%
                  </text>
                </svg>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Average lifecycle usage across packaging fleet (75/100 uses)</p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h5 className="text-sm font-medium text-tech-green mb-2">Refurbishment Prediction</h5>
          <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden p-3">
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="text-xs text-gray-400 mb-2">Upcoming Maintenance Needs</div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white">Next 7 days</span>
                  <span className="text-tech-green">42 units</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div className="bg-tech-green h-1.5 rounded-full" style={{ width: "15%" }}></div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-white">Next 30 days</span>
                  <span className="text-tech-green">156 units</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div className="bg-tech-green h-1.5 rounded-full" style={{ width: "35%" }}></div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-white">Next 90 days</span>
                  <span className="text-tech-green">310 units</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div className="bg-tech-green h-1.5 rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CustomerIncentiveVisual() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <h4 className="text-xl font-bold text-white mb-4">Customer Incentive Analyst</h4>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h5 className="text-sm font-medium text-tech-green mb-2">Return Rate vs. Rewards</h5>
          <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
            <div>{/* Placeholder for chart */}</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Analyze return rates versus reward structures</p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h5 className="text-sm font-medium text-tech-green mb-2">Loyalty Boost Correlation</h5>
          <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
            <div>{/* Placeholder for chart */}</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Correlate incentive program participation with loyalty boost</p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 md:col-span-2">
          <h5 className="text-sm font-medium text-tech-green mb-2">User Behavior Segmentation</h5>
          <div className="h-24 flex items-center justify-center">
            <p className="text-gray-400">Segmentation data and insights will be displayed here.</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">Segment user behavior based on return patterns and rewards</p>
        </div>
      </div>
    </motion.div>
  )
}

function SustainabilityTrackerVisual() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <h4 className="text-xl font-bold text-white mb-4">Sustainability Tracker</h4>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h5 className="text-sm font-medium text-tech-green mb-2">Waste Reduction</h5>
          <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
            <div>{/* Placeholder for chart */}</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Track waste reduction metrics</p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h5 className="text-sm font-medium text-tech-green mb-2">CO2 Savings</h5>
          <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
            <div>{/* Placeholder for chart */}</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Monitor CO2 savings</p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 md:col-span-2">
          <h5 className="text-sm font-medium text-tech-green mb-2">Reuse Rates</h5>
          <div className="h-24 flex items-center justify-center">
            <p className="text-gray-400">Reuse rate data will be displayed here.</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">Track reuse rates per shipment or period</p>
        </div>
      </div>
    </motion.div>
  )
}

function ImplementationTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-white">Implementation Timeline</h3>
        <p className="text-gray-300 mt-2">
          A phased approach to integrating our smart packaging system into your existing logistics infrastructure.
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-tech-radial opacity-20 rounded-xl"></div>

        <div className="relative z-10 bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h4 className="text-xl font-bold text-white mb-4">Phased Implementation</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phase 1 */}
            <div className="space-y-2">
              <h5 className="text-lg font-medium text-tech-green">Phase 1: Assessment & Planning</h5>
              <p className="text-sm text-gray-300">Timeline: 4 weeks</p>
              <ul className="list-disc list-inside text-sm text-gray-400">
                <li>Initial consultation and needs analysis</li>
                <li>Logistics infrastructure assessment</li>
                <li>Custom solution design</li>
              </ul>
            </div>

            {/* Phase 2 */}
            <div className="space-y-2">
              <h5 className="text-lg font-medium text-tech-green">Phase 2: System Integration</h5>
              <p className="text-sm text-gray-300">Timeline: 6 weeks</p>
              <ul className="list-disc list-inside text-sm text-gray-400">
                <li>Platform setup and configuration</li>
                <li>API integration with existing systems</li>
                <li>Packaging unit deployment</li>
              </ul>
            </div>

            {/* Phase 3 */}
            <div className="space-y-2">
              <h5 className="text-lg font-medium text-tech-green">Phase 3: Launch & Optimization</h5>
              <p className="text-sm text-gray-300">Timeline: Ongoing</p>
              <ul className="list-disc list-inside text-sm text-gray-400">
                <li>System launch and user training</li>
                <li>Performance monitoring and optimization</li>
                <li>Ongoing support and maintenance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
