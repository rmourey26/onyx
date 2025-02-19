"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Mail, GitBranch, Palette, DollarSign, type LucideIcon } from "lucide-react"

interface Feature {
  icon: React.ReactElement<LucideIcon>
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <Mail className="w-8 h-8" />,
    title: "USPS-Compliant Reusable Mailers",
    description:
      "Engineered to be machinable and to meet USPS size limits, ensuring easy returns with no extra hassle.",
  },
  {
    icon: <GitBranch className="w-8 h-8" />,
    title: "Smart Tracking with Blockchain",
    description:
      "Our ReTrace system links each package to customers and orders, enabling seamless tracking and incentivized returns.",
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: "Custom Branding",
    description: "Fully customizable with high-quality printing options to enhance your brand's sustainability story.",
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: "Lower Costs, Higher Impact",
    description:
      "Reduce shipping waste, minimize return processing fees, and meet sustainability goals without added complexity.",
  },
]

interface FeatureCardProps extends Feature {
  index: number
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-background text-foreground rounded-lg shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl dark:hover:bg-accent transition-all duration-300"
    >
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}

const WhyResendIt: React.FC = () => {
  return (
    <section className="py-16 ">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">Why Resend-It?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyResendIt

