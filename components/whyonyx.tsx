"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Mail, BitcoinIcon, Palette, DollarSign, type LucideIcon } from "lucide-react"
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
    title: "USPS-Compliant Solutions",
    description:
      "Engineered to bring high tech to global supply chain and logistics industries.",
  },
  {
    icon: <BitcoinIcon className="w-8 h-8" />,
    title: "Enterprise Blockchain",
    description:
      "Onyx's next generation blockchain architecture is designed for optimal enterprise usability.",
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: "Custom Branding",
    description: "Onyx white label enhances your brand's sustainability story.",
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: "Lower Costs, Higher Impact",
    description:
      "Cut costs, exceed sustainability goals without added complexity.",
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

const WhyOnyx: React.FC = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">Why Onyx?</h2>
   
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyOnyx

