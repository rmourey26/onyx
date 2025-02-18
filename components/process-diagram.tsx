"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ProcessDiagram() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const data = [
    { name: "Receive", value: 25 },
    { name: "Remove", value: 25 },
    { name: "Fold", value: 25 },
    { name: "Return", value: 25 }
  ]

  const steps = [
    { title: "Receive", description: "Order arrives." },
    { title: "Remove", description: "Enjoy!" },
    { title: "Fold", description: "Prep return." },
    { title: "Return", description: "Mail back" }
  ]

  const getChartDimensions = () => {
    if (windowWidth <= 320) return { width: 200, height: 200, innerRadius: 35, outerRadius: 75 }
    if (windowWidth <= 456) return { width: 240, height: 240, innerRadius: 45, outerRadius: 90 }
    return { width: 300, height: 300, innerRadius: 60, outerRadius: 120 }
  }

  const { width, height, innerRadius, outerRadius } = getChartDimensions()

  return (
    <Card className="w-full max-w-3xl mx-auto bg-background text-foreground">
      <CardHeader className="text-center p-3 sm:p-4 md:p-6">
        <CardTitle className="text-xl sm:text-2xl md:text-4xl font-light">How Resend-It Works</CardTitle>
        <CardDescription className="text-muted-foreground text-xs sm:text-sm md:text-base">
          Resend-It makes it easy to participate in the circular economy.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative p-2 sm:p-4 md:p-6">
        <div className="flex justify-center items-center">
          <div className={`relative w-[${width}px] h-[${height}px]`}>
            <PieChart width={width} height={height}>
              <Pie
                data={data}
                cx={width / 2}
                cy={height / 2}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                fill="hsl(var(--primary))"
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                ))}
              </Pie>
            </PieChart>
            {/* Step Numbers */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {['1', '2', '3', '4'].map((num, index) => (
                  <span key={num} className={`absolute text-background text-xs sm:text-sm md:text-base
                    ${index === 0 ? 'top-[25%] left-[25%]' : 
                      index === 1 ? 'top-[25%] right-[25%]' : 
                      index === 2 ? 'bottom-[25%] right-[25%]' : 
                      'bottom-[25%] left-[25%]'}`}>
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Step Labels */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`relative w-[${width + 80}px] h-[${height + 80}px]`}>
            {steps.map((step, index) => {
              const angle = (index * Math.PI) / 2 - Math.PI / 4
              const radius = outerRadius + 20
              const x = Math.cos(angle) * radius + width / 2
              const y = Math.sin(angle) * radius + height / 2
              
              return (
                <div
                  key={index}
                  className="absolute text-center w-24 sm:w-28 md:w-32"
                  style={{
                    left: `${x - (windowWidth <= 320 ? 48 : windowWidth <= 456 ? 56 : 64)}px`,
                    top: `${y - 20}px`,
                  }}
                >
                  <h3 className="font-medium mb-1 text-xs sm:text-sm md:text-base">{step.title}</h3>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

