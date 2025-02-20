"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Mail, GitBranch, Palette, DollarSign, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Icons } from "./icons"

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
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="text-primary p-2 rounded-full bg-primary/10">{icon}</div>
          </div>
          <CardTitle className="text-xl font-semibold text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const WhyResendIt: React.FC = () => {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">Why</h2>
        <Link href="/" className="inline-block items-center space-x-2">
          <Icons.resendit className="h-5 w-18" />
          <span className="inline-block text-3xl md:text-4xl font-bold">?</span>

        </Link>
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

