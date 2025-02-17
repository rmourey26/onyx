"use client"

import { PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ProcessDiagram() {
  const data = [
    { name: "Receive Package", value: 25 },
    { name: "Remove Product", value: 25 },
    { name: "Fold Mailer", value: 25 },
    { name: "Return", value: 25 },
  ]

  const steps = [
    { title: "Receive Package", description: "Get your order." },
    { title: "Remove Product", description: "Enjoy!" },
    { title: "Fold Mailer", description: "Prep for return." },
    { title: "Return", description: "Mail it back" },
  ]

  return (
    <Card className="w-full max-w-3xl mx-auto bg-slate-800 text-white">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-light">How Resend-It Works</CardTitle>
        <CardDescription className="text-slate-300">
          Resend-It makes it easy to participate in the circular economy.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex justify-center items-center">
          <div className="relative w-[300px] h-[300px]">
            <PieChart width={300} height={300}>
              <Pie
                data={data}
                cx={150}
                cy={150}
                innerRadius={60}
                outerRadius={120}
                fill="#fff"
                dataKey="value"
                stroke="#475569"
                strokeWidth={2}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="#fff" />
                ))}
              </Pie>
            </PieChart>
            {/* Step Numbers */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                <span className="absolute top-[25%] left-[25%] text-slate-800">1</span>
                <span className="absolute top-[25%] right-[25%] text-slate-800">2</span>
                <span className="absolute bottom-[25%] right-[25%] text-slate-800">3</span>
                <span className="absolute bottom-[25%] left-[25%] text-slate-800">4</span>
              </div>
            </div>
          </div>
        </div>
        {/* Step Labels */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[400px] h-[400px]">
            {steps.map((step, index) => {
              const angle = (index * Math.PI) / 2 - Math.PI / 4
              const radius = 180
              const x = Math.cos(angle) * radius + 200
              const y = Math.sin(angle) * radius + 200

              return (
                <div
                  key={index}
                  className="absolute text-center w-40"
                  style={{
                    left: `${x - 80}px`,
                    top: `${y - 20}px`,
                  }}
                >
                  <h3 className="font-medium mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-300">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

