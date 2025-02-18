"use client"

import { motion } from "framer-motion"
import { Package, BitcoinIcon as Blockchain, Palette, DollarSign } from "lucide-react"

const features = [
  {
    title: "USPS-Compliant Reusable Mailers",
    description:
      "Engineered to be machinable and to meet USPS size limits, ensuring easy returns with no extra hassle.",
    icon: Package,
  },
  {
    title: "Smart Tracking with Blockchain",
    description:
      "Our ReTrace system links each package to customers and orders, enabling seamless tracking and incentivized returns.",
    icon: Blockchain,
  },
  {
    title: "Custom Branding",
    description: "Fully customizable with high-quality printing options to enhance your brand's sustainability story.",
    icon: Palette,
  },
  {
    title: "Lower Costs, Higher Impact",
    description:
      "Reduce shipping waste, minimize return processing fees, and meet sustainability goals without added complexity.",
    icon: DollarSign,
  },
]

const FeatureCard = ({ title, description, icon: Icon }) => {
  return (
    <motion.div
      className="bg-secondary rounded-lg shadow-lg p-6 flex flex-col items-center text-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-primary rounded-full p-3 mb-4">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  )
}

export default function WhyResendIt() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Resend-It?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

