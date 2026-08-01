"use client"

import { motion } from "framer-motion"
import { NetworkIcon as NetworkOff, Layers, Cpu, Clock } from "lucide-react"

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
    "The Kronova platform provides a single, cohesive foundation for intelligent automation. Our secure AI communication network (AetherNet) allows AI agents to collaborate. The Learning Layer ensures they grow smarter with your business. And the post-quantum secure AetherChain provides an immutable source of truth for all operations, especially for high-stakes environments like IoT, robotics, and autonomous vehicles.",
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
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-15 pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl enterprise-text-gradient">
            Break Free From Yesterday&apos;s Limitations
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-center max-w-3xl mx-auto">
            Businesses globally are struggling to integrate AI meaningfully, ensure trust, and escape the hamster wheel
            of manual work. The Kronova platform provides the architectural breakthrough for the next generation of
            autonomous enterprise.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <div className="enterprise-card h-full p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-primary/15 to-accent/10 rounded-lg border border-primary/20">
                    {problem.icon}
                  </div>
                  <h3 className="font-semibold text-foreground">{problem.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{problem.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="enterprise-card mt-12 p-8 md:p-12"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex-shrink-0 p-4 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl border border-primary/20">
              {solution.icon}
            </div>
            <div>
              <h3 className="text-2xl font-semibold enterprise-text-gradient">{solution.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{solution.description}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
