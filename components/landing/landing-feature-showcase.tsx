"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck,
  Cpu,
  Blocks,
  Zap,
  BrainCircuit,
  Bot,
  Wrench,
  ChevronRight,
  ChevronLeft,
  Network,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function EcosystemShowcase() {
  const [activeSection, setActiveSection] = useState(0)
  const sections = [
    "AI Agent Network",
    "The Learning Layer",
    "Blockchain Trust Ledger",
    "Vertical AI Solutions",
    "Developer Ecosystem",
  ]

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % sections.length)
    }, 10000)
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [sections.length])

  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
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
    <section
      id="ecosystem-showcase"
      className="w-full py-16 md:py-24 bg-black bg-grid-pattern-dark relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute blockchain-node opacity-50"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animation: `float ${6 + Math.random() * 6}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-4 text-white sm:text-4xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500">
            The Aether Foundation: Our Three Pillars of Innovation
          </span>
        </h2>
        <p className="text-lg text-center mb-12 text-gray-400 max-w-3xl mx-auto">
          Our platform is built on a synergistic trio of foundational technologies designed to unlock autonomous
          operations for any industry.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => handleSectionChange(index)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black",
                activeSection === index
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700",
              )}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="relative min-h-[620px] md:min-h-[580px] bg-gray-900/70 rounded-2xl p-6 md:p-8 backdrop-blur-md border border-gray-700/50 shadow-2xl">
          <AnimatePresence mode="wait">
            {activeSection === 0 && <AetherNetContent key="aethernet" />}
            {activeSection === 1 && <LearningLayerContent key="learning" />}
            {activeSection === 2 && <AetherChainContent key="aetherchain" />}
            {activeSection === 3 && <VerticalSolutionsContent key="bizopt" />}
            {activeSection === 4 && <DeveloperEcosystemContent key="deveco" />}
          </AnimatePresence>

          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-gray-800/70 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors z-20"
            aria-label="Previous feature"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-gray-800/70 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors z-20"
            aria-label="Next feature"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSectionChange(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                activeSection === index ? "bg-primary scale-125" : "bg-gray-600 hover:bg-gray-500",
              )}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const MotionDiv = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
  >
    {children}
  </motion.div>
)

const FeatureText = ({
  title,
  description,
  points,
  launchInfo,
}: {
  title: string
  description: string
  points: { icon: React.ReactNode; title: string; desc: string }[]
  launchInfo?: string
}) => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-white">{title}</h3>
    {launchInfo && <p className="text-sm text-primary font-semibold">{launchInfo}</p>}
    <p className="text-gray-300 text-lg leading-relaxed">{description}</p>
    <div className="space-y-4 pt-2">
      {points.map((point, i) => (
        <motion.div
          key={point.title}
          className="flex items-start gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
        >
          <div className="mt-1 p-2 bg-primary/20 rounded-lg text-primary flex-shrink-0">{point.icon}</div>
          <div>
            <h4 className="font-semibold text-white">{point.title}</h4>
            <p className="text-sm text-gray-400">{point.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)

const FeatureVisual = ({ imgSrc, altText }: { imgSrc: string; altText: string }) => (
  <motion.div
    className="relative aspect-video bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden shadow-xl"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.2, duration: 0.5 }}
  >
    <Image src={imgSrc || "/placeholder.svg"} alt={altText} fill className="object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
  </motion.div>
)

function AetherNetContent() {
  return (
    <MotionDiv>
      <FeatureText
        title="1. The AI Agent Network (AetherNet)"
        description="AetherNet is a secure, AI-native communication network that acts as the central nervous system for your operations. It allows diverse AI agents to discover each other, securely exchange context, and collaborate on complex workflows, future-proofing your business."
        points={[
          {
            icon: <Bot size={20} />,
            title: "Autonomous Agent Collaboration",
            desc: "Build entire teams of AI agents that work together, sharing insights and tasks to solve complex problems without human intervention.",
          },
          {
            icon: <Network size={20} />,
            title: "Standardized Context Exchange",
            desc: "A secure transport layer for standardized data flow between AI models, IoT devices, and external tools, eliminating integration headaches.",
          },
          {
            icon: <Cpu size={20} />,
            title: "Optimized for IoT & Robotics",
            desc: "Specifically designed for high-throughput, low-latency communication required by drones, robotics, and autonomous vehicles.",
          },
        ]}
      />
      <FeatureVisual imgSrc="/images/landing/aethernet-iot-robotics.png" altText="AetherNet for IoT and Robotics" />
    </MotionDiv>
  )
}

function LearningLayerContent() {
  return (
    <MotionDiv>
      <FeatureVisual
        imgSrc="/images/landing/feature-ai-agent-network.png"
        altText="The Learning Layer visual"
        query="glowing neural network brain with data flowing into it, representing a learning layer for an AI platform"
      />
      <FeatureText
        title="2. The Learning Layer"
        description="This is our proprietary intelligence engine. The Learning Layer enables your entire AI ecosystem to automatically gain experience and wisdom from every action and data point. It's not just automation; it's evolution."
        points={[
          {
            icon: <Zap size={20} />,
            title: "Exponential Efficiency Gains",
            desc: "As your business and data grow, the platform becomes exponentially more efficient, anticipating needs and optimizing workflows.",
          },
          {
            icon: <BrainCircuit size={20} />,
            title: "Collective Intelligence",
            desc: "Insights from one agent or workflow contribute to the collective wisdom of the entire system, accelerating improvement across the board.",
          },
          {
            icon: <BarChart3 size={20} />,
            title: "Proactive Optimization",
            desc: "The system learns to identify opportunities and threats before they become critical, moving from reactive to predictive operations.",
          },
        ]}
      />
    </MotionDiv>
  )
}

function AetherChainContent() {
  return (
    <MotionDiv>
      <FeatureText
        title="3. The Blockchain Trust Ledger (AetherChain)"
        description="AetherChain is a high-performance, post-quantum secure blockchain that provides an immutable, auditable record of all significant events. It's the ultimate foundation of trust for your data, transactions, and AI-driven decisions."
        points={[
          {
            icon: <ShieldCheck size={20} />,
            title: "Post-Quantum Security",
            desc: "Protecting your most critical data against the threats of today and tomorrow with next-generation cryptography.",
          },
          {
            icon: <Blocks size={20} />,
            title: "Verifiable Digital Twin",
            desc: "Create an unchangeable history for every asset, transaction, or workflow, eliminating disputes and ensuring compliance.",
          },
          {
            icon: <Zap size={20} />,
            title: "High-Performance for Enterprise",
            desc: "Engineered to handle the massive transaction volume of enterprise-scale IoT and AI applications without compromising speed.",
          },
        ]}
      />
      <FeatureVisual imgSrc="/images/landing/aetherchain-secure-ledger.png" altText="AetherChain Secure Ledger" />
    </MotionDiv>
  )
}

function VerticalSolutionsContent() {
  return (
    <MotionDiv>
      <FeatureVisual
        imgSrc="/images/landing/resendit-optimization-engine.png"
        altText="Resend-It Business Optimization Engine"
      />
      <FeatureText
        title="Vertical AI Solutions"
        description="Leverage our foundational platform to deploy specialized AI solutions across any business vertical. From optimizing complex supply chains to automating financial analysis, our platform provides the tools to build for your specific industry needs."
        points={[
          {
            icon: <BarChart3 size={20} />,
            title: "Cross-Industry AI Analytics",
            desc: "Tailorable AI models and agents to optimize processes in manufacturing, healthcare, finance, logistics, and more.",
          },
          {
            icon: <Bot size={20} />,
            title: "Intelligent Workflow Automation",
            desc: "Automate resource allocation, operational decisions, and customer interactions with secure, collaborative AI agents.",
          },
          {
            icon: <Zap size={20} />,
            title: "Rapid Solution Deployment",
            desc: "Utilize our pre-built templates and developer tools to quickly launch powerful AI solutions tailored to your market.",
          },
        ]}
      />
    </MotionDiv>
  )
}

function DeveloperEcosystemContent() {
  return (
    <MotionDiv>
      <FeatureText
        title="Pioneering Developer Ecosystem"
        description="Build the future on Aether. Our comprehensive APIs, SDKs, and tools empower developers to create custom AI agents for AetherNet, deploy Rust smart contracts on AetherChain, and integrate with the entire Resend-It Ecosystem."
        points={[
          {
            icon: <Wrench size={20} />,
            title: "AetherNet Agent SDK (API v1 Soon)",
            desc: "Develop, deploy, and manage secure AI agents for IoT, robotics, and diverse automation tasks.",
          },
          {
            icon: <Blocks size={20} />,
            title: "AetherChain Smart Contracts (Q3 2025)",
            desc: "Build high-performance Rust-based smart contracts for verifiable business logic and decentralized workflows.",
          },
          {
            icon: <Cpu size={20} />,
            title: "Unified API & Tooling",
            desc: "Seamlessly interact with all layers of the Aether ecosystem through a cohesive developer experience.",
          },
        ]}
      />
      <FeatureVisual imgSrc="/images/landing/developer-ecosystem-unified.png" altText="Aether Developer Ecosystem" />
    </MotionDiv>
  )
}
