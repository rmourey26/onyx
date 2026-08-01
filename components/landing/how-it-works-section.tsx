"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { BarChart3, ShieldCheck, Bot, BrainCircuit } from "lucide-react"

const steps = [
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: "1. Deploy Your AI Workforce",
    description:
      "Build or deploy pre-configured AI agents for specific tasks. Connect your systems, IoT devices, or data sources to AetherNet and watch your autonomous team come to life, ready to collaborate.",
    image: "/images/landing/workflow-iot-data-ingestion.png",
    alt: "Businesses connecting IoT devices and deploying AI agents on AetherNet",
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
    title: "2. Orchestrate, Learn, and Verify",
    description:
      "Agents securely communicate and execute complex workflows. The Learning Layer enhances their collective intelligence with every task, while AetherChain immutably records critical events for ultimate trust.",
    image: "/images/landing/workflow-ai-blockchain-synergy.png",
    alt: "AetherNet AI Agents processing data, verified by AetherChain",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: "3. Achieve Exponential Results",
    description:
      "Access actionable, real-time insights and automated decisions that save significant manual labor hours and deliver results up to 200x faster than traditional computing, giving you an unparalleled competitive edge.",
    image: "/images/landing/workflow-roi-sustainability-dashboard.png",
    alt: "Dashboard showing ROI and business insights from the Aether platform",
  },
]

export function HowItWorksSection() {
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-15 pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl enterprise-text-gradient">
            From Deployment to Dominance in Three Steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Our platform provides a seamless flow from initial setup to verifiable outcomes and maximized business
            value.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:gap-10"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className={`enterprise-card flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-8 md:gap-12 p-6 md:p-8`}
            >
              <div className="md:w-1/2 relative aspect-video w-full overflow-hidden rounded-xl border border-border/40">
                <Image src={step.image || "/placeholder.svg"} alt={step.alt} fill className="object-cover" />
              </div>
              <div className="md:w-1/2 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/10 rounded-xl border border-primary/20">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-semibold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                {index === 0 && (
                  <div className="flex items-center text-sm text-primary pt-2 border-l-2 border-primary/40 pl-3">
                    <Bot className="w-4 h-4 mr-2 shrink-0" /> AetherNet API v1 (Secure AI Agents) - Launching Soon
                  </div>
                )}
                {index === 1 && (
                  <div className="flex items-center text-sm text-primary pt-2 border-l-2 border-primary/40 pl-3">
                    <ShieldCheck className="w-4 h-4 mr-2 shrink-0" /> AetherChain (Trust Layer) - Launching Q3 2025
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
