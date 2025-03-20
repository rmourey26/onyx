"use client"

import type React from "react"
import { BitcoinIcon, Cloud, Shield, Zap } from 'lucide-react'
import { motion } from "framer-motion"
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
    icon: <BitcoinIcon className="w-8 h-8" />,
    title: "Blockchain AI Analytics",
    description:
      "Harness the power of blockchain AI to derive actionable insights from your data",
  },
  {
    icon: <Cloud className="w-8 h-8" />,
    title: "Hybrid Architecture",
    description:
      "All the benefits of next generation blockchain technology with the ease of todays cloud platforms",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Enterprise Grade Security",
    description: "State of the art security measures to protect your most valuable assets now and into the quantum era.",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Optimal Results",
    description:
      "Optimized for speed and efficiency, our solutions deliver unparalleled performance and energy efficiency.",
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

const Featurez: React.FC = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-10 text-foreground">Transformative Solutions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Featurez