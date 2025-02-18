"use client"

import type React from "react"
import { motion } from "framer-motion"
import { BitcoinIcon as Blockchain, Package, Palette, DollarSign } from "lucide-react"

const InfoGraphicItem = ({
  title,
  description,
  icon: Icon,
  index,
}: { title: string; description: string; icon: React.ElementType; index: number }) => (
  <motion.div
    className="flex flex-col items-center mb-8 group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.2 }}
    whileHover={{ scale: 1.05 }}
  >
    <motion.div
      className="font-extrabold text-primary mb-2 flex items-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2 + index * 0.2, type: "spring", stiffness: 100 }}
    >
      <Icon className="mr-2 text-primary" size={32} />
      {title}
    </motion.div>
    <motion.div
      className="text-center text-sm max-w-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 + index * 0.2 }}
    >
      {description}
    </motion.div>
  </motion.div>
)

const WhyResendIt = () => {
  const items = [
    { title: "USPS-Compliant Reusable Mailers" , 
      description: "Engineered to be machinable and to meet USPS size limits, ensuring easy returns with no extra hassle.", 
      icon: Package },
    {
      title: "Smart Tracking with Blockchain",
      description:"Our ReTrace system links each package to customers and orders, enabling seamless tracking and incentivized returns.",
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

  return (
    <div className="bg-background text-foreground p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
      <motion.h2
        className="font-extrabold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Why Resend-It?
      </motion.h2>
      <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <InfoGraphicItem key={index} title={item.title} description={item.description} icon={item.icon} index={index} />
        ))}
      </div>
    </div>
  )
}

export default WhyResendIt