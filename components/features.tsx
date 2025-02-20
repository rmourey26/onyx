"use client"

import { Bitcoin, Cloud, Shield, Zap } from 'lucide-react'
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    name: "Blockchain-AI Analytics",
    description: "Harness the power of blockchain AI to derive actionable insights from your data.",
    icon: Bitcoin,
  },
  {
    name: "Hybrid Architecture",
    description: "Scalable, resilient, and efficient solutions built for the digital era",
    icon: Cloud,
  },
  {
    name: "Enterprise-Grade Security",
    description: "State-of-the-art security measures to protect your most valuable assets now and into the quantum era.",
    icon: Shield,
  },
  {
    name: "High-Performance Systems",
    description: "Optimized for speed and efficiency, our solutions deliver unparalleled performance and energy efficiency.",
    icon: Zap,
  },
]

export default function Features() {
  return (
    <section className="container space-y-16 py-24 md:py-32">
      <motion.div 
        className="mx-auto max-w-4xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-extrabold leading-[1.1]">Cutting-Edge Solutions</h2>
        <p className="mt-4 text-muted-foreground">
          Discover how Onyx can transform your business our quantum inspired AI protocol and enterprise grade blockchain.
        </p>
      </motion.div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        {features.map((feature, index) => (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <feature.icon className="h-8 w-8" />
                  {feature.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}