"use client"

import { motion } from "framer-motion"
import { NetworkIcon as NetworkOff, Layers, Cpu, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const problems = [
  {
    icon: <NetworkOff className="h-8 w-8 text-amber-500" />,
    title: "Fragmented AI & Data Silos",
    description:
      "Disconnected systems and proprietary AI models prevent true interoperability, limiting automation potential and creating critical security gaps.",
  },
  {
    icon: <Clock className="h-8 w-8 text-destructive" />,
    title: "Crippling Manual Workflows",
    description:
      "Reliance on human intervention for complex processes creates bottlenecks, increases operational costs, and stifles growth and innovation.",
  },
  {
    icon: <Cpu className="h-8 w-8 text-blue-500" />,
    title: "Stagnant, Inflexible Automation",
    description:
      "Traditional automation is brittle and rule-based. It cannot learn, adapt, or handle the complex, dynamic challenges of modern business.",
  },
]

const solution = {
  icon: <Layers className="h-10 w-10 text-primary" />,
  title: "A Unified Platform for Autonomous Operations",
  description:
    "The Resend-It platform provides a single, cohesive foundation for intelligent automation. Our secure AI communication network (AetherNet) allows AI agents to collaborate. The Learning Layer ensures they grow smarter with your business. And the post-quantum secure AetherChain provides an immutable source of truth for all operations, especially for high-stakes environments like IoT, robotics, and autonomous vehicles.",
}

export function ProblemSolutionSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl">
            Break Free From Yesterday's Limitations
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-center max-w-3xl mx-auto">
            Businesses globally are struggling to integrate AI meaningfully, ensure trust, and escape the hamster wheel
            of manual work. The Resend-It platform provides the architectural breakthrough for the next generation of
            autonomous enterprise.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <Card className="h-full shadow-lg hover:shadow-xl transition-shadow bg-card">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {problem.icon}
                    <CardTitle>{problem.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{problem.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 bg-card border rounded-xl p-8 md:p-12 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="flex-shrink-0 p-4 bg-primary/10 rounded-full">{solution.icon}</div>
            <div>
              <h3 className="text-2xl font-semibold text-primary">{solution.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{solution.description}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
