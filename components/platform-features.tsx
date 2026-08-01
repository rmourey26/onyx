"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Recycle,
  Radio,
  Blocks,
  Brain,
  QrCode,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  LineChart,
  Workflow,
  Rocket,
  Microscope,
  Settings,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function PlatformFeatures() {
  const [activeSection, setActiveSection] = useState(0)
  const sections = ["Smart Circular Packaging", "System Benefits", "Quantifiable Impact", "Implementation Timeline"]

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % sections.length)
    }, 12000)

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
    }, 12000)
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
        <div className="flex items-center justify-center mb-12">
          <div className="relative h-16 w-16 mr-4">
            <Image src="/images/resendit-icon.png" alt="Kronova Logo" fill className="object-contain" />
          </div>
          <h2 className="text-4xl font-bold text-center text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
              Smart Circular Economy
            </span>
            <span className="block text-xl mt-2 text-gray-400">Packaging System Features</span>
          </h2>
        </div>

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
            {activeSection === 1 && <SystemBenefits key="system-benefits" />}
            {activeSection === 2 && <QuantifiableImpact key="quantifiable-impact" />}
            {activeSection === 3 && <ImplementationTimeline key="implementation-timeline" />}
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
        <h3 className="text-2xl font-bold text-white">Introducing Smart Circular Packaging</h3>
        <p className="text-gray-300">
          Our core concept combines durable, brandable packaging with seamlessly embedded advanced technologies. The
          system is sustainable by design, dramatically reducing waste through high reusability and responsible
          end-of-life biodegradability.
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
                <Recycle className="h-4 w-4 text-tech-green" />
              </span>
              Reusable & Biodegradable
            </h4>
            <p className="mt-2 text-sm text-gray-400">Durable for 100 uses, then biodegrades</p>
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
                <Radio className="h-4 w-4 text-tech-green" />
              </span>
              Smart Tracking (IoT)
            </h4>
            <p className="mt-2 text-sm text-gray-400">Real-time location and condition monitoring</p>
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
                <Blocks className="h-4 w-4 text-tech-green" />
              </span>
              Immutable Trust (Blockchain)
            </h4>
            <p className="mt-2 text-sm text-gray-400">Tamper-proof authentication and journey logging</p>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-tech-green/50 transition-colors"
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h4 className="font-medium text-white flex items-center gap-2">
              <span className="p-1 bg-tech-green/20 rounded">
                <Brain className="h-4 w-4 text-tech-green" />
              </span>
              Intelligent Optimization (AI)
            </h4>
            <p className="mt-2 text-sm text-gray-400">
              Predictive rewards, logistics insights, and supply chain analysis
            </p>
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

            <h4 className="text-xl font-bold text-white mb-6">The Packaging Paradox</h4>

            <p className="text-sm text-gray-300 mb-6">
              Traditional packaging methods create a paradox of costs, waste, and inefficiency that holds businesses
              back in today's competitive market.
            </p>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1">
                <h5 className="text-tech-green font-medium">Sustainability Pressure</h5>
                <p className="text-xs text-gray-400">
                  70% of consumers will pay premium prices for sustainable options, yet single-use packaging remains
                  prevalent, contributing to significant environmental impact.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="text-tech-green font-medium">Logistics Opacity & Cost</h5>
                <p className="text-xs text-gray-400">
                  Standard supply chains suffer from lack of real-time tracking, leading to lost goods and poor
                  visibility. Implementing efficient reverse logistics for reusable packaging remains complex.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="text-tech-green font-medium">Operational Inefficiencies</h5>
                <p className="text-xs text-gray-400">
                  Warehousing faces constraints from bulky packaging and time-consuming manual sorting processes,
                  driving up operational overhead.
                </p>
              </div>
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

function SystemBenefits() {
  const [activeFeature, setActiveFeature] = useState(0)
  const features = [
    {
      title: "IoT Sensors",
      description:
        "Gain unprecedented visibility, enhanced security, and ensure quality control with real-time data on package location and condition.",
      icon: <Radio className="h-6 w-6" />,
    },
    {
      title: "Blockchain Ledger",
      description:
        "Reduce fraud, build stakeholder trust, and enable transparent reward distribution with a secure, unchangeable record.",
      icon: <Blocks className="h-6 w-6" />,
    },
    {
      title: "AI Engine",
      description:
        "Optimize logistics, reward distribution, predict inventory needs, identify operational bottlenecks, and generate actionable insights through our analytics engine.",
      icon: <Brain className="h-6 w-6" />,
    },
    {
      title: "QR Code Integration",
      description:
        "Utilize a simple, cost-effective interface for logistics personnel and customers to track package lifecycles and manage returns easily.",
      icon: <QrCode className="h-6 w-6" />,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [features.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-white">How Our System Drives Benefits</h3>
        <p className="text-gray-300 mt-2">
          Our integrated system combines multiple technologies to deliver comprehensive benefits across your entire
          supply chain.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => setActiveFeature(index)}
            className={cn(
              "p-4 rounded-lg transition-all duration-300 text-left",
              activeFeature === index ? "bg-tech-green text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg inline-flex mb-3",
                activeFeature === index ? "bg-white/20" : "bg-tech-green/20",
              )}
            >
              {activeFeature === index ? (
                <Radio className="h-4 w-4 text-white" />
              ) : (
                <Radio className="h-4 w-4 text-tech-green" />
              )}
            </div>
            <h4 className="font-medium">{feature.title}</h4>
            <p className={cn("text-sm mt-1", activeFeature === index ? "text-white/80" : "text-gray-400")}>
              {feature.description.substring(0, 60)}...
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8 relative">
        <div className="absolute inset-0 bg-tech-radial opacity-20 rounded-xl"></div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-start gap-6">
              <div className="p-4 bg-tech-green/20 rounded-lg">
                {activeFeature === 0 ? (
                  <Radio className="h-8 w-8 text-tech-green" />
                ) : activeFeature === 1 ? (
                  <Blocks className="h-8 w-8 text-tech-green" />
                ) : activeFeature === 2 ? (
                  <Brain className="h-8 w-8 text-tech-green" />
                ) : (
                  <QrCode className="h-8 w-8 text-tech-green" />
                )}
              </div>

              <div className="flex-1">
                <h4 className="text-xl font-bold text-white">{features[activeFeature].title}</h4>
                <p className="text-gray-300 mt-2">{features[activeFeature].description}</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeFeature === 0 && (
                    <>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Real-time Tracking</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Monitor package location throughout the entire supply chain, reducing loss and improving
                          delivery estimates.
                        </p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Condition Monitoring</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Track temperature, humidity, and impact data to ensure product integrity and identify
                          potential issues.
                        </p>
                      </div>
                    </>
                  )}

                  {activeFeature === 1 && (
                    <>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Immutable Records</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Every transaction and movement is permanently recorded, creating an unalterable chain of
                          custody for each package.
                        </p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Transparent Rewards</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Automatically distribute and track customer incentives for package returns with complete
                          transparency.
                        </p>
                      </div>
                    </>
                  )}

                  {activeFeature === 2 && (
                    <>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Predictive Analytics</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Forecast demand patterns, optimize inventory levels, and anticipate maintenance needs for
                          packaging units.
                        </p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Route Optimization</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Automatically calculate the most efficient delivery and return routes, reducing fuel
                          consumption and transit times.
                        </p>
                      </div>
                    </>
                  )}

                  {activeFeature === 3 && (
                    <>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Customer Interface</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Simple scanning process allows customers to easily initiate returns and receive rewards
                          without complex apps or training.
                        </p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-tech-green">Logistics Integration</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          QR codes seamlessly connect with existing warehouse management systems for efficient
                          processing and sorting.
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

function QuantifiableImpact() {
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null)

  const metrics = [
    { value: "40%", label: "Warehouse Space Reduction" },
    { value: "27%", label: "Handling Time Decrease" },
    { value: "100x", label: "Reusability Per Unit" },
    { value: "22%", label: "Carbon Footprint Reduction" },
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
        <h3 className="text-2xl font-bold text-white">Quantifiable Impact: ROI and ESG Advancement</h3>
        <p className="text-gray-300 mt-2">
          Our system delivers demonstrable results across critical business areas. Beyond these operational and
          sustainability improvements, you'll see approximately 30% return on cost savings based on projected models and
          a 15% boost in measured brand loyalty via the incentive program.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-tech-green/50 transition-all duration-300"
            onMouseEnter={() => setHoveredMetric(index)}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <motion.div
              animate={hoveredMetric === index ? { scale: 1.05, color: "#34A853" } : { scale: 1, color: "#34A853" }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold text-tech-green mb-2"
            >
              {metric.value}
            </motion.div>
            <p className="text-gray-300">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
        >
          <h4 className="text-xl font-bold text-white mb-4 flex items-center">
            <BarChart3 className="mr-2 h-6 w-6 text-tech-green" />
            Operational Benefits
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Warehouse Efficiency</span>
                <span className="text-tech-green">40%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-tech-green h-2 rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Processing Speed</span>
                <span className="text-tech-green">27%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-tech-green h-2 rounded-full" style={{ width: "27%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Cost Savings</span>
                <span className="text-tech-green">30%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-tech-green h-2 rounded-full" style={{ width: "30%" }}></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
        >
          <h4 className="text-xl font-bold text-white mb-4 flex items-center">
            <LineChart className="mr-2 h-6 w-6 text-tech-green" />
            Sustainability Impact
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Carbon Reduction</span>
                <span className="text-tech-green">22%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-tech-green h-2 rounded-full" style={{ width: "22%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Waste Elimination</span>
                <span className="text-tech-green">95%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-tech-green h-2 rounded-full" style={{ width: "95%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Brand Loyalty Boost</span>
                <span className="text-tech-green">15%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-tech-green h-2 rounded-full" style={{ width: "15%" }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function ImplementationTimeline() {
  const [activePhase, setActivePhase] = useState(0)

  const phases = [
    {
      title: "Discovery Phase",
      duration: "2-3 weeks",
      description: "Assessment of current operations",
      icon: <Microscope className="h-6 w-6" />,
      details:
        "We conduct a comprehensive analysis of your existing logistics infrastructure, packaging needs, and sustainability goals to create a tailored implementation plan.",
    },
    {
      title: "Integration Setup",
      duration: "4-6 weeks",
      description: "Systems configuration and testing",
      icon: <Settings className="h-6 w-6" />,
      details:
        "Our technical team configures the platform to integrate with your existing systems, sets up the blockchain infrastructure, and conducts thorough testing to ensure seamless operation.",
    },
    {
      title: "Pilot Program",
      duration: "6-8 weeks",
      description: "Limited deployment and refinement",
      icon: <Workflow className="h-6 w-6" />,
      details:
        "We launch a controlled pilot with a subset of your operations, gathering data and feedback to optimize the system before full-scale deployment.",
    },
    {
      title: "Full Deployment",
      duration: "8-12 weeks",
      description: "Scale to full operational capacity",
      icon: <Rocket className="h-6 w-6" />,
      details:
        "The system is rolled out across your entire operation with ongoing support and optimization to ensure maximum benefit realization.",
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
        <h3 className="text-2xl font-bold text-white">Implementation Timeline</h3>
        <p className="text-gray-300 mt-2">
          The demand for sustainable and efficient logistics is undeniable. Our holistic system uniquely combines
          reusability, biodegradability, IoT, blockchain, AI, and customer incentives. Built on robust, scalable
          technology platforms, we provide the ongoing support to guarantee your successful implementation.
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-tech-radial opacity-20 rounded-xl"></div>

        <div className="relative z-10 bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h4 className="text-xl font-bold text-white mb-8">Phased Implementation Approach</h4>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-700"></div>

            {/* Timeline nodes */}
            <div className="space-y-16">
              {phases.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.2, duration: 0.5 }}
                  className="relative"
                >
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setActivePhase(index)}
                      className={cn(
                        "absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300",
                        activePhase === index ? "bg-tech-green" : "bg-gray-800 hover:bg-gray-700",
                      )}
                    >
                      {activePhase === index ? (
                        <Microscope className="h-5 w-5 text-white" />
                      ) : index === 1 ? (
                        <Settings className="h-5 w-5 text-tech-green" />
                      ) : index === 2 ? (
                        <Workflow className="h-5 w-5 text-tech-green" />
                      ) : (
                        <Rocket className="h-5 w-5 text-tech-green" />
                      )}
                    </button>
                  </div>

                  <div className={cn("grid grid-cols-2 gap-8 mt-6", index % 2 === 1 ? "md:grid-flow-dense" : "")}>
                    <div
                      className={cn(
                        "bg-gray-800/50 p-4 rounded-lg border transition-all duration-300",
                        activePhase === index ? "border-tech-green/50" : "border-gray-700",
                      )}
                    >
                      <h5 className="text-lg font-medium text-white">{phase.title}</h5>
                      <p className="text-tech-green text-sm">{phase.duration}</p>
                      <p className="text-gray-400 mt-2">{phase.description}</p>

                      {activePhase === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-gray-700"
                        >
                          <p className="text-sm text-gray-300">{phase.details}</p>
                        </motion.div>
                      )}
                    </div>
                    <div></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <h5 className="text-lg font-medium text-white">Secure Your Competitive Edge Today</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <CheckCircle className="h-6 w-6 text-tech-green mx-auto mb-2" />
                <h6 className="font-medium text-white">Confirm Scope</h6>
                <p className="text-xs text-gray-400 mt-1">
                  Let's finalize your order or pilot program details based on your specific requirements.
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <CheckCircle className="h-6 w-6 text-tech-green mx-auto mb-2" />
                <h6 className="font-medium text-white">Seamless Onboarding</h6>
                <p className="text-xs text-gray-400 mt-1">
                  Our dedicated team will partner with yours for efficient integration into your existing systems.
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <CheckCircle className="h-6 w-6 text-tech-green mx-auto mb-2" />
                <h6 className="font-medium text-white">Launch & Optimize</h6>
                <p className="text-xs text-gray-400 mt-1">
                  Start realizing the benefits and leveraging insights from your custom analytics dashboard immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
