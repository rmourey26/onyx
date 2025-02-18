"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Leaf, Recycle, Heart } from "lucide-react"

const InfoGraphicItem = ({
  percentage,
  text,
  icon: Icon,
  index,
}: { percentage: number; text: string; icon: React.ElementType; index: number }) => (
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
      {percentage}%
    </motion.div>
    <motion.div
      className="text-center text-sm max-w-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 + index * 0.2 }}
    >
      {text}
    </motion.div>
  </motion.div>
)

const AnimatedInfographic = () => {
  const items = [
    { percentage: 70, text: "Pay a premium for sustainable packaging.", icon: Leaf },
    {
      percentage: 66,
      text: "Ease of use significant factor.",
      icon: Recycle,
    },
    {
      percentage: 84,
      text: "Loyal to brands who share values.",
      icon: Heart,
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
        Untapped Consumers
      </motion.h2>
      <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <InfoGraphicItem key={index} percentage={item.percentage} text={item.text} icon={item.icon} index={index} />
        ))}
      </div>
    </div>
  )
}

export default AnimatedInfographic

