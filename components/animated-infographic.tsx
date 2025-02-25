"use client"

import React from "react"
import { motion, useAnimation } from "framer-motion"
import { Leaf, Recycle, Heart, AwardIcon } from "lucide-react"
import { useInView } from "react-intersection-observer"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const InfoGraphicItem = ({
  percentage,
  text,
  icon: Icon,
  index,
}: { percentage: number; text: string; icon: React.ElementType; index: number }) => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  React.useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 },
      }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="flex flex-col items-center mb-8 group"
    >
      <motion.div
        className="text-4xl font-bold text-primary mb-2 flex items-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 + index * 0.2, type: "spring", stiffness: 100 }}
      >
        <Icon className="mr-2 text-primary" size={32} />
        {percentage}%
      </motion.div>
      <motion.div
        className="text-center text-sm max-w-xs mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 + index * 0.2 }}
      >
        {text}
      </motion.div>
      <motion.div
        className="w-full max-w-[200px]"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.6 + index * 0.2, duration: 1, ease: "easeOut" }}
      >
        <Progress value={percentage} className="h-2" />
      </motion.div>
    </motion.div>
  )
}

const AnimatedInfographic = () => {
  const items = [
    {
      percentage: 84,
      text: "Loyal to brands with similar values.",
      icon: Heart,
    },
    { 
      percentage: 70, 
      text: "Pay a premium for digital solutions.", 
      icon: Leaf 
    },
    {
      percentage: 66,
      text: "Ease of use significant factor.",
      icon: Recycle,
    },
    { 
      percentage: 64,
      text: "Alter behavior via incentives and rewards",
      icon: AwardIcon,
    },
    
    
    

  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl md:text-4xl font-bold text-center">Untapped Consumers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <InfoGraphicItem key={index} percentage={item.percentage} text={item.text} icon={item.icon} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default AnimatedInfographic